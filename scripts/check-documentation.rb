#!/usr/bin/env ruby
# Standard-library-only, local source/docs checks. No network or Git mutations.
require 'json'
require 'open3'
require 'optparse'
require 'pathname'
require 'tmpdir'
require 'fileutils'
require 'uri'

class DocumentationCheck
  attr_reader :errors, :modules, :checked_docs
  def initialize(root)
    @root = File.realpath(root)
    @errors = []
    @modules = []
    @checked_docs = []
  end

  def local_path(relative, from = @root)
    return nil if relative.start_with?('/') || relative.include?("\0")
    full = File.expand_path(relative, from)
    return nil unless full.start_with?(@root + '/')
    return nil if File.exist?(full) && !File.realpath(full).start_with?(@root + '/')
    full
  end

  def matches?(pattern, path)
    File.fnmatch?(pattern, path, File::FNM_PATHNAME | File::FNM_EXTGLOB)
  end

  # Ordered map: first matching module is the accountable owner. Shared test
  # helpers can be placed before broad test-directory patterns.
  def owner(path)
    modules.find { |mod| mod.fetch('sources').any? { |pattern| matches?(pattern, path) } }
  end

  def source_path?(path)
    path.start_with?('Sources/', 'Tests/', 'src/controls/', 'design/') ||
      %w[Package.swift package.json package-lock.json scripts/check-documentation.rb docs/source-map.json].include?(path) ||
      path.start_with?('.github/')
  end

  def validate
    data = JSON.parse(File.read(File.join(@root, 'docs/source-map.json')))
    raise 'Unsupported source map version' unless data['schemaVersion'] == 1
    @modules = data.fetch('modules')
    raise 'Missing modules' unless modules.is_a?(Array) && !modules.empty?
    ids = modules.map { |mod| mod.fetch('id') }
    raise 'Duplicate module IDs' unless ids.uniq == ids
    modules.each do |mod|
      %w[sources docs].each do |key|
        values = mod.fetch(key)
        raise "Empty #{key} for #{mod['id']}" unless values.is_a?(Array) && !values.empty?
        values.each do |value|
          raise "Unsafe #{key} path for #{mod['id']}" unless value.is_a?(String) && local_path(value)
        end
      end
      mod['docs'].each { |doc| errors << "Missing owning doc: #{doc}" unless File.file?(local_path(doc)) }
    end
    @checked_docs = (data.fetch('entryPoints') + modules.flat_map { |mod| mod['docs'] }).uniq
    checked_docs.each { |doc| check_links(doc) }
    Dir.glob(File.join(@root, '{Sources,Tests,src/controls,design}/**/*')).select { |file| File.file?(file) }.each do |file|
      relative = Pathname(file).relative_path_from(Pathname(@root)).to_s
      errors << "Unmapped source: #{relative}" unless owner(relative)
    end
    self
  rescue JSON::ParserError, KeyError, RuntimeError, Errno::ENOENT => error
    errors << "Source map invalid: #{error.message}"
    self
  end

  def check_links(doc)
    path = local_path(doc)
    unless path && File.file?(path)
      errors << "Missing current doc: #{doc}"
      return
    end
    File.read(path).scan(/\[[^\]]*\]\((?:<([^>]+)>|([^\s)]+))\)/).each do |angled, plain|
      target = angled || plain
      next if target.match?(%r{\A[a-z][a-z0-9+.-]*:}i)
      relative, fragment = target.split('#', 2)
      destination = relative.empty? ? path : local_path(URI::DEFAULT_PARSER.unescape(relative), File.dirname(path))
      unless destination && File.exist?(destination)
        errors << "Broken or escaping link in #{doc}: #{target}"
        next
      end
      next unless fragment && File.extname(destination) == '.md'
      headings = File.read(destination).lines.map do |line|
        heading = line[/\A\#{1,6}\s+(.+?)\s*\#*\s*\z/, 1]
        heading&.downcase&.gsub(/[^\p{Alnum}_\- ]/, '')&.gsub(/\s+/, '-')
      end.compact
      errors << "Missing TOC anchor in #{doc}: #{target}" unless headings.include?(fragment)
    end
  end

  def check_impact(changed)
    changed.each do |path|
      errors << "Unmapped changed source: #{path}" if source_path?(path) && owner(path).nil?
    end
    touched = changed.map { |path| owner(path) }.compact.uniq
    touched.each do |mod|
      unless (mod['docs'] & changed).any?
        errors << "Documentation update required for #{mod['id']}: #{mod['docs'].join(' or ')}"
      end
    end
    touched.map { |mod| mod['id'] }
  end
end

def self_test
  Dir.mktmpdir('cieo-doc-check-') do |root|
    FileUtils.mkdir_p(File.join(root, 'docs'))
    FileUtils.mkdir_p(File.join(root, 'Sources'))
    File.write(File.join(root, 'Sources/Feature.swift'), '')
    File.write(File.join(root, 'docs/feature.md'), "# Feature\n\n[Contents](#feature)\n")
    map = { schemaVersion: 1, entryPoints: ['docs/feature.md'], modules: [
      { id: 'feature', sources: ['Sources/Feature.swift'], docs: ['docs/feature.md'] }
    ] }
    File.write(File.join(root, 'docs/source-map.json'), JSON.generate(map))
    healthy = DocumentationCheck.new(root).validate
    raise 'Healthy fixture rejected' unless healthy.errors.empty?
    healthy.check_impact(['Sources/Feature.swift', 'docs/feature.md'])
    raise 'Complete change rejected' unless healthy.errors.empty?
    missing = DocumentationCheck.new(root).validate
    missing.check_impact(['Sources/Feature.swift'])
    raise 'Missing doc update accepted' unless missing.errors.any? { |error| error.include?('update required') }
    File.write(File.join(root, 'Sources/Unknown.swift'), '')
    unknown = DocumentationCheck.new(root).validate
    raise 'Unmapped source accepted' unless unknown.errors.any? { |error| error.include?('Unmapped source') }
    File.write(File.join(root, 'docs/feature.md'), "[Gone](gone.md)\n[Escape](../../outside.md)\n[TOC](#absent)\n")
    bad = DocumentationCheck.new(root).validate
    raise 'Broken links accepted' unless bad.errors.count { |error| error.include?('link') } == 2
    raise 'Missing anchor accepted' unless bad.errors.any? { |error| error.include?('TOC anchor') }
    raise 'Path escape accepted' if bad.local_path('../outside')
    web = DocumentationCheck.new(root).validate
    web.check_impact(['src/controls/Unknown.tsx'])
    raise 'Unmapped web control accepted' unless web.errors.any? { |error| error.include?('Unmapped changed source') }
    map[:entryPoints] = ['../outside.md']
    File.write(File.join(root, 'docs/source-map.json'), JSON.generate(map))
    escaped = DocumentationCheck.new(root).validate
    raise 'Escaping entry point accepted' unless escaped.errors.any? { |error| error.include?('Missing current doc') }
  end
  puts 'Documentation checker self-tests passed: healthy, missing update, unmapped source, link/TOC and path escape.'
end

if $PROGRAM_NAME == __FILE__
  options = {}
  parser = OptionParser.new do |opts|
    opts.banner = 'Usage: ruby script/check_documentation.rb [--self-test] [--base SHA|HEAD] [--worktree] [--receipt PATH]'
    opts.on('--self-test') { options[:self_test] = true }
    opts.on('--base VALUE') { |value| options[:base] = value }
    opts.on('--worktree') { options[:worktree] = true }
    opts.on('--receipt PATH') { |value| options[:receipt] = value }
  end
  parser.parse!
  abort parser.to_s unless ARGV.empty?
  self_test if options[:self_test]
  root = File.expand_path('..', __dir__)
  check = DocumentationCheck.new(root).validate
  touched = []
  if (base = options[:base])
    abort 'Base must be HEAD or a full commit SHA' unless base == 'HEAD' || base.match?(/\A[0-9a-f]{40}\z/)
    output, status = Open3.capture2e('git', '-C', root, 'diff', '--name-only', base, '--')
    abort "Cannot read base revision: #{output}" unless status.success?
    changed = output.lines.map(&:chomp)
    if options[:worktree]
      output, status = Open3.capture2e('git', '-C', root, 'ls-files', '--others', '--exclude-standard')
      abort 'Cannot inspect untracked paths' unless status.success?
      changed += output.lines.map(&:chomp)
    end
    touched = check.check_impact(changed.uniq)
  elsif options[:worktree]
    abort '--worktree requires --base'
  end
  unless check.errors.empty?
    warn check.errors.uniq.join("\n")
    exit 1
  end
  sha, status = Open3.capture2e('git', '-C', root, 'rev-parse', 'HEAD')
  abort 'Cannot identify checked revision' unless status.success?
  summary = "Documentation checked current local files; HEAD baseline #{sha.strip}; #{check.modules.length} modules, #{check.checked_docs.length} current docs."
  puts summary
  puts "Changed module coverage: #{touched.empty? ? 'no compared source changes' : touched.join(', ')}"
  if options[:receipt]
    File.open(options[:receipt], 'a') do |file|
      file.puts("## Cieo documentation check\n\n#{summary}\n\nChanged modules: #{touched.join(', ')}\n\nLocal files/links and documentation impact passed. App/provider/deployment acceptance was not run by this job.")
    end
  end
end

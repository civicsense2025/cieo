#include <metal_stdlib>
using namespace metal;

// One color operation over decorative geometry. No texture sampling or offscreen blur.
[[ stitchable ]] half4 highlightSweep(float2 position, half4 color, float4 bounds, float progress) {
    float x = (position.x - bounds.x) / max(bounds.z, 1.0f);
    float center = mix(-0.2f, 1.2f, clamp(progress, 0.0f, 1.0f));
    half glow = half(1.0f - smoothstep(0.0f, 0.16f, abs(x - center)));
    // Preserve alpha and premultiplication so translucent edges cannot bloom outside the shape.
    return half4(min(color.rgb + half3(glow * color.a * 0.18h), half3(color.a)), color.a);
}

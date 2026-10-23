/** Visible label for the button. `previewing` only matters while following: it shows the action a press would take. */
export declare function followLabel(following: boolean, previewing: boolean): 'Follow' | 'Following' | 'Unfollow';
export interface FollowButtonProps {
    /** Whether the viewer follows the person right now. */
    following: boolean;
    /** Called on every press; the host flips `following`. */
    onToggle: () => void;
    /** Who is being followed, for the accessible name ("Follow Ava"). Optional. */
    name?: string;
    /** Control height. Defaults to md. */
    size?: 'sm' | 'md';
}
export declare function FollowButton({ following, onToggle, name, size }: FollowButtonProps): import("react/jsx-runtime").JSX.Element;

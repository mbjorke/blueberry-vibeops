import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface UserAvatarProps {
  /**
   * URL to the user's profile image
   */
  imageUrl?: string;
  /**
   * User's name for the avatar fallback
   */
  name?: string;
  /**
   * User's email to display in the dropdown
   */
  email?: string;
  /**
   * URL to the user's resume/CV (optional)
   */
  resumeUrl?: string;
  /**
   * Callback for when profile is clicked (if resumeUrl is not provided)
   */
  onProfileClick?: () => void;
  /**
   * Callback for when settings is clicked
   */
  onSettingsClick?: () => void;
  /**
   * Callback for when sign out is clicked
   */
  onSignOut?: () => void;
}

export const UserAvatar = ({
  imageUrl,
  name = "User",
  email = "user@example.com",
  resumeUrl,
  onProfileClick,
  onSettingsClick,
  onSignOut,
}: UserAvatarProps) => {
  const { toast } = useToast();
  
  // Extract initials from name
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleProfileClick = (e: React.MouseEvent) => {
    if (resumeUrl) {
      // If resumeUrl is provided, don't prevent default to allow the link to work
      return;
    }
    
    e.preventDefault();
    if (onProfileClick) {
      onProfileClick();
    } else {
      toast({
        title: "Profile",
        description: "Profile dialog will be implemented here.",
      });
    }
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSettingsClick) {
      onSettingsClick();
    } else {
      toast({
        title: "Settings",
        description: "Settings dialog will be implemented here.",
      });
    }
  };

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSignOut) {
      onSignOut();
    } else {
      toast({
        title: "Signed out",
        description: "You have been signed out.",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-12 w-12 rounded-full p-0 hover:bg-accent/20 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Avatar className="h-12 w-12">
            {imageUrl ? (
              <AvatarImage src={imageUrl} alt={name} />
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {resumeUrl ? (
          <DropdownMenuItem asChild>
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="w-full">
              View CV / Resume
            </a>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={handleProfileClick}>
            Profile
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleSettingsClick}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

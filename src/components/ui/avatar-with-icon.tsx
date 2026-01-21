import { Avatar, AvatarImage, AvatarFallback } from "./avatar";
import { cn } from "../../lib/utils";
import { User as UserIcon } from "lucide-react";
import React from "react";

interface AvatarWithIconProps {
  /** Source URL for the avatar image */
  imageUrl?: string;
  /** Display name or initials for the fallback */
  name?: string;
  /** Icon component to display when no image is provided */
  icon?: React.ComponentType<{ className?: string }>;
  /** Background color class for the fallback/icon */
  colorClass?: string;
  /** Text color class for the icon */
  iconColorClass?: string;
  /** CSS class name for the root element */
  className?: string;
  /** Size of the avatar in pixels */
  size?: number;
  /** Click handler */
  onClick?: () => void;
  /** Label text to display next to the avatar */
  label?: string;
  /** Whether to show the label */
  showLabel?: boolean;
  /** Additional class name for the label */
  labelClassName?: string;
  /** Children elements */
  /** Children elements */
  children?: React.ReactNode;
}

const AvatarWithIcon: React.FC<AvatarWithIconProps> = ({
  imageUrl,
  name,
  icon: Icon,
  colorClass = "bg-muted",
  iconColorClass = "text-foreground/70",
  className,
  size,
  onClick,
  label,
  showLabel = false,
  labelClassName,
  children,
}) => {
  // Generate initials from name if provided
  const getInitials = (nameStr?: string) => {
    if (!nameStr) return "";
    return nameStr
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const avatarContent = (
    <Avatar className="h-full w-full">
      {imageUrl && (
        <AvatarImage
          src={imageUrl}
          alt={name || ""}
          className="object-cover"
        />
      )}
      <AvatarFallback
        className={cn(
          "flex h-full w-full items-center justify-center font-medium",
          colorClass
        )}
      >
        {Icon ? (
          <Icon className={cn("h-2/3 w-2/3", iconColorClass)} />
        ) : name ? (
          getInitials(name)
        ) : (
          <UserIcon className={cn("h-2/3 w-2/3", iconColorClass)} />
        )}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <div 
      className={cn(
        "inline-flex items-center rounded-full overflow-hidden",
        colorClass,
        className
      )}
      onClick={onClick}
      style={size ? { '--avatar-size': `${size}px` } as React.CSSProperties : undefined}
    >
      <div 
        className={cn("flex items-center justify-center p-0.5", {
          'w-[var(--avatar-size)] h-[var(--avatar-size)]': size !== undefined,
        })}
      >
        {avatarContent}
        {children}
      </div>
      {showLabel && label && (
        <span 
          className={cn(
            "pr-2 py-0.5 text-base font-medium whitespace-nowrap",
            iconColorClass || "text-foreground",
            labelClassName
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export { AvatarWithIcon };
export default AvatarWithIcon;

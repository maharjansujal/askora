import {
  ButtonHTMLAttributes,
  cloneElement,
  ComponentType,
  isValidElement,
  ReactElement,
} from "react";

type ButtonVariant =
  | "default"
  | "outline"
  | "secondary"
  | "ghost"
  | "destructive";

type ButtonSize = "sm" | "md" | "lg" | "xl";

type IconProps = {
  size?: number | string;
  width?: number | string;
  height?: number | string;
  className?: string;
};

type IconComponent = ComponentType<IconProps>;

type ButtonIcon = IconComponent | ReactElement<IconProps>;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ButtonIcon;
  iconPosition?: "left" | "right";
};

const variants: Record<ButtonVariant, string> = {
  default: "bg-primary text-foreground shadow-sm hover:bg-primary/90",
  outline:
    "border border-border bg-background text-foreground shadow-sm hover:bg-muted",
  secondary:
    "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
  ghost: "bg-transparent text-foreground hover:bg-muted",
  destructive:
    "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
};

const sizes: Record<
  ButtonSize,
  {
    className: string;
    iconSize: number;
  }
> = {
  sm: {
    className: "h-9 px-3 text-xs gap-1.5 rounded-md",
    iconSize: 14,
  },
  md: {
    className: "h-10 px-4 text-sm gap-2 rounded-lg",
    iconSize: 16,
  },
  lg: {
    className: "h-11 px-5 text-base gap-2.5 rounded-lg",
    iconSize: 18,
  },
  xl: {
    className: "h-12 px-6 text-base gap-3 rounded-xl",
    iconSize: 20,
  },
};

const renderIcon = (icon: ButtonIcon | undefined, size: number) => {
  if (!icon) return null;

  if (isValidElement<IconProps>(icon)) {
    return cloneElement(icon, {
      size,
      width: size,
      height: size,
      className: `shrink-0 ${icon.props.className ?? ""}`,
    });
  }

  const Icon = icon;

  return <Icon size={size} width={size} height={size} className="shrink-0" />;
};

export const Button = ({
  children,
  loading = false,
  disabled,
  className = "",
  variant = "default",
  size = "md",
  icon,
  iconPosition = "left",
  type = "button",
  ...props
}: ButtonProps) => {
  const sizeConfig = sizes[size];

  const renderedIcon = loading ? (
    <span
      className="shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
      style={{
        width: sizeConfig.iconSize,
        height: sizeConfig.iconSize,
      }}
    />
  ) : (
    renderIcon(icon, sizeConfig.iconSize)
  );

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={[
        "inline-flex cursor-pointer items-center justify-center font-sans font-medium",
        "outline-none transition-all duration-150",
        "focus-visible:ring-2 focus-visible:ring-ring",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "active:scale-[0.99]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizeConfig.className,
        className,
      ].join(" ")}
      {...props}
    >
      {loading ? (
        <>
          {renderedIcon}
          <span>Loading...</span>
        </>
      ) : (
        <>
          {iconPosition === "left" && renderedIcon}

          <span>{children}</span>

          {iconPosition === "right" && renderedIcon}
        </>
      )}
    </button>
  );
};

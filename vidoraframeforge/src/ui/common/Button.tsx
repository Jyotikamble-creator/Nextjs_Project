import React from "react";
import classNames from "classnames";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  loading = false,
  disabled,
  className,
  ...rest
}) => {
  const baseClasses =
    "px-4 py-2 rounded font-medium transition-colors duration-200 focus:outline-none";

  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-black hover:bg-gray-300",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={classNames(
        baseClasses,
        variantClasses[variant],
        disabled || loading ? "opacity-50 cursor-not-allowed" : "",
        className
      )}
    >
      {loading ? "Loading..." : children}
    </button>
  );
};

export default Button;

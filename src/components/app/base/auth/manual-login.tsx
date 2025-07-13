"use client";

import { Label as LabelPrimitive } from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { type ClassValue, clsx } from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import type * as React from "react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      data-slot="button"
      {...props}
    />
  );
}

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className
      )}
      data-slot="input"
      type={type}
      {...props}
    />
  );
}

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive>) {
  return (
    <LabelPrimitive
      className={cn(
        "flex select-none items-center gap-2 font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
        className
      )}
      data-slot="label"
      {...props}
    />
  );
}

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className
      )}
      data-slot="textarea"
      {...props}
    />
  );
}

interface ManualAuthData {
  kubeconfig: string;
  regionToken: string;
  appToken: string;
  devboxToken: string;
}

export default function ManualLogin() {
  const [formData, setFormData] = useState<ManualAuthData>({
    kubeconfig: "",
    regionToken: "",
    appToken: "",
    devboxToken: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleInputChange = (field: keyof ManualAuthData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate required fields
      if (
        !formData.kubeconfig ||
        !formData.regionToken ||
        !formData.appToken ||
        !formData.devboxToken
      ) {
        setError("All fields are required");
        setIsLoading(false);
        return;
      }

      // Store auth data in localStorage
      localStorage.setItem("sealos-brain-auth", JSON.stringify(formData));

      // Simulate successful login
      const redirectUrl = searchParams.get("redirect") || "/";
      router.push(redirectUrl);
      router.refresh();
    } catch (err) {
      setError("Failed to save authentication data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form method="post" onSubmit={onSubmit}>
        <div className="space-y-4">
          <div>
            <Label className="font-medium text-foreground" htmlFor="kubeconfig">
              Kubeconfig *
            </Label>
            <Textarea
              className="mt-2"
              id="kubeconfig"
              name="kubeconfig"
              onChange={(e) => handleInputChange("kubeconfig", e.target.value)}
              placeholder="apiVersion: v1..."
              required
              value={formData.kubeconfig}
            />
          </div>

          <div>
            <Label
              className="font-medium text-foreground"
              htmlFor="regionToken"
            >
              Region Token *
            </Label>
            <Input
              className="mt-2"
              id="regionToken"
              name="regionToken"
              onChange={(e) => handleInputChange("regionToken", e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              required
              type="password"
              value={formData.regionToken}
            />
          </div>

          <div>
            <Label className="font-medium text-foreground" htmlFor="appToken">
              App Token *
            </Label>
            <Input
              className="mt-2"
              id="appToken"
              name="appToken"
              onChange={(e) => handleInputChange("appToken", e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              required
              type="password"
              value={formData.appToken}
            />
          </div>

          <div>
            <Label
              className="font-medium text-foreground"
              htmlFor="devboxToken"
            >
              Devbox Token *
            </Label>
            <Input
              className="mt-2"
              id="devboxToken"
              name="devboxToken"
              onChange={(e) => handleInputChange("devboxToken", e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              required
              type="password"
              value={formData.devboxToken}
            />
          </div>
        </div>

        {error && <div className="mt-4 text-destructive text-sm">{error}</div>}

        <Button className="mt-6 w-full" disabled={isLoading} type="submit">
          {isLoading ? "Saving..." : "Save Configuration"}
        </Button>
      </form>
    </div>
  );
}

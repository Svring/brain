"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React, { memo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { TemplateResource } from "@/lib/sealos/resources/template/schemas/template-api-context-schemas";

export type TemplateInputDialogProps = {
	template: TemplateResource;
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (templateForm: Record<string, string>) => void;
	isLoading?: boolean;
};

// Helper function to create dynamic form schema based on template inputs
function createFormSchema(template: TemplateResource) {
	const schemaFields: Record<string, z.ZodTypeAny> = {};

	if (template.spec.inputs) {
		Object.entries(template.spec.inputs).forEach(([key, input]) => {
			const i: any = input as any;
			if (!i) return;

			switch (i.type) {
				case "string":
				case "choice": {
					if (i.required) {
						schemaFields[key] = z.string().min(1, `${key} is required`);
					} else {
						schemaFields[key] = z.string().optional();
					}
					break;
				}
				case "number": {
					if (i.required) {
						schemaFields[key] = z
							.string()
							.min(1, `${key} is required`)
							.refine(
								(val) => !isNaN(Number(val)),
								`${key} must be a valid number`,
							);
					} else {
						schemaFields[key] = z
							.string()
							.optional()
							.refine(
								(val) => val === undefined || val === "" || !isNaN(Number(val)),
								`${key} must be a valid number`,
							);
					}
					break;
				}
				case "boolean": {
					schemaFields[key] = z.boolean();
					break;
				}
				default: {
					if (i.required) {
						schemaFields[key] = z.string().min(1, `${key} is required`);
					} else {
						schemaFields[key] = z.string().optional();
					}
				}
			}
		});
	}

	return z.object(schemaFields);
}

// Helper function to get default values
function getDefaultValues(template: TemplateResource) {
	const defaults: Record<string, any> = {};

	if (template.spec.inputs) {
		Object.entries(template.spec.inputs).forEach(([key, input]) => {
			const i: any = input as any;
			if (!i) return;

			switch (i.type) {
				case "boolean":
					defaults[key] = i.default === "true" || i.default === true;
					break;
				case "number":
					defaults[key] = i.default?.toString() || "";
					break;
				default:
					defaults[key] = i.default?.toString() || "";
			}
		});
	}

	return defaults;
}

export const TemplateInputDialog = memo(function TemplateInputDialog({
	template,
	isOpen,
	onClose,
	onSubmit,
	isLoading = false,
}: TemplateInputDialogProps) {
	const formSchema = createFormSchema(template);
	const defaultValues = getDefaultValues(template);

	// Check if template has any required fields
	const hasRequired = Boolean(
		template.spec.inputs &&
			Object.values(template.spec.inputs).some(
				(input: any) => input?.required === true,
			),
	);

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues,
	});

	const handleSubmit = (values: Record<string, any>) => {
		// Convert all values to strings for the API
		const templateForm: Record<string, string> = {};
		Object.entries(values).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				templateForm[key] = String(value);
			}
		});
		onSubmit(templateForm);
		// Keep dialog open to show deploying state
	};

	const renderFormField = (key: string, input: any) => {
		switch (input.type) {
			case "choice":
				return (
					<FormField
						key={key}
						control={form.control}
						name={key}
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									{key}
									{input.required && (
										<span className="text-red-500 ml-1">*</span>
									)}
								</FormLabel>
								<Select onValueChange={field.onChange} value={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder={`Select ${key}`} />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{input.options?.map((option: string) => (
											<SelectItem key={option} value={option}>
												{option}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{input.description && (
									<FormDescription>{input.description}</FormDescription>
								)}
								<FormMessage />
							</FormItem>
						)}
					/>
				);

			case "boolean":
				return (
					<FormField
						key={key}
						control={form.control}
						name={key}
						render={({ field }) => (
							<FormItem className="flex flex-row items-start space-x-3 space-y-0">
								<FormControl>
									<Checkbox
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
								<div className="space-y-1 leading-none">
									<FormLabel>
										{key}
										{input.required && (
											<span className="text-red-500 ml-1">*</span>
										)}
									</FormLabel>
									{input.description && (
										<FormDescription>{input.description}</FormDescription>
									)}
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>
				);

			case "number":
				return (
					<FormField
						key={key}
						control={form.control}
						name={key}
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									{key}
									{input.required && (
										<span className="text-red-500 ml-1">*</span>
									)}
								</FormLabel>
								<FormControl>
									<Input
										type="number"
										placeholder={input.default?.toString() || ""}
										{...field}
									/>
								</FormControl>
								{input.description && (
									<FormDescription>{input.description}</FormDescription>
								)}
								<FormMessage />
							</FormItem>
						)}
					/>
				);

			default: // string and other types
				return (
					<FormField
						key={key}
						control={form.control}
						name={key}
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									{key}
									{input.required && (
										<span className="text-red-500 ml-1">*</span>
									)}
								</FormLabel>
								<FormControl>
									<Input
										placeholder={input.default?.toString() || ""}
										{...field}
									/>
								</FormControl>
								{input.description && (
									<FormDescription>{input.description}</FormDescription>
								)}
								<FormMessage />
							</FormItem>
						)}
					/>
				);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={isLoading ? undefined : onClose}>
			<DialogContent className="max-w-md max-h-[60vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Configure {template.spec.title}</DialogTitle>
					<DialogDescription>
						Please provide the required configuration parameters for this
						template.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-6"
					>
						<div className="space-y-4">
							{template.spec.inputs &&
								Object.entries(template.spec.inputs).map(([key, input]) => {
									if (!input) return null;
									return renderFormField(key, input);
								})}
						</div>

						<DialogFooter className="flex gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								disabled={isLoading}
								className="flex-1"
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isLoading} className="flex-1">
								{isLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Deploying...
									</>
								) : (
									"Deploy"
								)}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
});

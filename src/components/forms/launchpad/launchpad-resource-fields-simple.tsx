"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import {
	convertK8sResourceToNumeric,
	convertResourceTypeToTarget,
} from "@/lib/k8s/k8s-method/k8s-utils";
import {
	LAUNCHPAD_CPU_OPTIONS,
	LAUNCHPAD_MEMORY_OPTIONS,
	type LaunchpadCpuOption,
	type LaunchpadMemoryOption,
	type LaunchpadResourceUpdate,
} from "@/schemas/forms/launchpad/components/launchpad-resource-schema";

interface LaunchpadResourceFieldsSimpleProps {
	cpuOptions?: readonly LaunchpadCpuOption[];
	memoryOptions?: readonly LaunchpadMemoryOption[];
}

export const LaunchpadResourceFieldsSimple = ({
	cpuOptions = LAUNCHPAD_CPU_OPTIONS,
	memoryOptions = LAUNCHPAD_MEMORY_OPTIONS,
}: LaunchpadResourceFieldsSimpleProps = {}) => {
	const form = useFormContext<{
		resource: LaunchpadResourceUpdate;
		name: string;
	}>();
	const resourceValues = form.watch("resource");
	const nameValue = form.watch("name");

	// Construct both deployment and statefulset targets
	const deploymentTarget = convertResourceTypeToTarget("deployment", nameValue);
	const statefulsetTarget = convertResourceTypeToTarget(
		"statefulset",
		nameValue,
	);

	// Use useResourceStatus to get the launchpad resource from both targets
	const { resource: deploymentObject } = useResourceStatus(deploymentTarget);

	const { resource: statefulsetObject } = useResourceStatus(statefulsetTarget);

	// Use the object that exists (only one will have valid data)
	const object = deploymentObject?.resource || statefulsetObject?.resource;

	console.log("object", object);

	// Helper function to create comparison display
	const createComparisonDisplay = (
		formValue: number,
		objectValue: number | undefined,
		unit: string,
	) => {
		if (objectValue !== undefined && objectValue !== formValue) {
			const isObjectValueInOptions = memoryOptions.includes(formValue);

			if (!isObjectValueInOptions) {
				return (
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground line-through">
							{formValue}
							{unit}
						</span>
						<span className="text-muted-foreground">→</span>
						<span className="font-medium">
							{objectValue}
							{unit}
						</span>
					</div>
				);
			} else {
				return (
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground line-through">
							{objectValue}
							{unit}
						</span>
						<span className="text-muted-foreground">→</span>
						<span className="font-medium">
							{formValue}
							{unit}
						</span>
					</div>
				);
			}
		}
		return (
			<span className="font-medium">
				{formValue}
				{unit}
			</span>
		);
	};

	// Convert object values to numeric for comparison
	const objectNumeric = convertK8sResourceToNumeric({
		cpu: object?.cpu,
		memory: object?.memory,
	});

	// Helper function to find the nearest available option
	const findNearestOption = (value: number, options: readonly number[]) => {
		return options.reduce((prev, curr) =>
			Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev,
		);
	};

	// Get rounded values for comparison (rounded to nearest available options)
	const roundedObjectValues = {
		cpu:
			objectNumeric.cpu.nearest !== undefined
				? findNearestOption(objectNumeric.cpu.nearest, cpuOptions)
				: undefined,
		memory:
			objectNumeric.memory.nearest !== undefined
				? findNearestOption(objectNumeric.memory.nearest, memoryOptions)
				: undefined,
	};

	// Initialize form values with object values when resource values are null
	useEffect(() => {
		if (
			objectNumeric.cpu.nearest !== undefined &&
			resourceValues?.cpu === null
		) {
			// Use the rounded value as the initial form value
			form.setValue("resource.cpu", roundedObjectValues.cpu!);
		}

		if (
			objectNumeric.memory.nearest !== undefined &&
			resourceValues?.memory === null
		) {
			// Use the rounded value as the initial form value
			form.setValue("resource.memory", roundedObjectValues.memory!);
		}
	}, [objectNumeric, resourceValues, form]);

	return (
		<div className="space-y-2 px-2">
			{/* CPU Options - show if cpu is provided (either as value or null) */}
			{resourceValues && "cpu" in resourceValues && (
				<FormField
					control={form.control}
					name="resource.cpu"
					render={({ field }) => {
						const currentIndex =
							cpuOptions.findIndex((option) => option === field.value) || 0;

						return (
							<FormItem>
								<div className="flex items-center gap-2">
									<FormLabel className="font-medium">CPU:</FormLabel>
									{createComparisonDisplay(
										field.value || cpuOptions[0],
										roundedObjectValues.cpu,
										"C",
									)}
								</div>
								<div className="space-y-2">
									<Slider
										value={[currentIndex]}
										onValueChange={(value) =>
											field.onChange(cpuOptions[value[0]])
										}
										min={0}
										max={cpuOptions.length - 1}
										step={1}
										className="[&>:last-child>span]:h-6 [&>:last-child>span]:w-2.5 [&>:last-child>span]:border-[3px] [&>:last-child>span]:border-background [&>:last-child>span]:bg-primary [&>:last-child>span]:ring-offset-0"
										aria-label="CPU slider"
									/>
									<div className="flex justify-between">
										<span className="text-xs text-muted-foreground">
											{cpuOptions[0]}C
										</span>
										<span className="text-xs text-muted-foreground">
											{cpuOptions[cpuOptions.length - 1]}C
										</span>
									</div>
								</div>
								<FormMessage />
							</FormItem>
						);
					}}
				/>
			)}

			{/* Memory Options - show if memory is provided (either as value or null) */}
			{resourceValues && "memory" in resourceValues && (
				<FormField
					control={form.control}
					name="resource.memory"
					render={({ field }) => {
						const currentIndex =
							memoryOptions.findIndex((option) => option === field.value) || 0;

						return (
							<FormItem>
								<div className="flex items-center gap-2">
									<FormLabel className="font-medium">Memory:</FormLabel>
									{createComparisonDisplay(
										field.value || memoryOptions[0],
										roundedObjectValues.memory,
										"G",
									)}
								</div>
								<div className="space-y-2">
									<Slider
										value={[currentIndex]}
										onValueChange={(value) =>
											field.onChange(memoryOptions[value[0]])
										}
										min={0}
										max={memoryOptions.length - 1}
										step={1}
										className="[&>:last-child>span]:h-6 [&>:last-child>span]:w-2.5 [&>:last-child>span]:border-[3px] [&>:last-child>span]:border-background [&>:last-child>span]:bg-primary [&>:last-child>span]:ring-offset-0"
										aria-label="Memory slider"
									/>
									<div className="flex justify-between">
										<span className="text-xs text-muted-foreground">
											{memoryOptions[0]}G
										</span>
										<span className="text-xs text-muted-foreground">
											{memoryOptions[memoryOptions.length - 1]}G
										</span>
									</div>
								</div>
								<FormMessage />
							</FormItem>
						);
					}}
				/>
			)}
		</div>
	);
};

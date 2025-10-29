"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type {
	ListTemplateResponse,
	TemplateApiContext,
	TemplateResource,
	TemplateResponseV1,
} from "@/lib/sealos/resources/template/schemas/template-api-context-schemas";
import {
	getTemplateOptions,
	listTemplatesOptions,
} from "@/lib/sealos/resources/template/template-method/template-query";

export function useTemplates(context: TemplateApiContext) {
	const [selectedTemplate, setSelectedTemplate] =
		useState<TemplateResource | null>(null);
	const [selectedTemplateName, setSelectedTemplateName] = useState<
		string | null
	>(null);

	const {
		data: templatesResponse,
		isLoading,
		error,
	} = useQuery(listTemplatesOptions(context));

	const templates = useMemo(
		() => (templatesResponse as ListTemplateResponse)?.data?.templates ?? [],
		[templatesResponse],
	);

	const {
		data: templateResponse,
		isLoading: isTemplateLoading,
		error: templateError,
	} = useQuery({
		...getTemplateOptions(context, selectedTemplateName || ""),
		enabled: !!selectedTemplateName && !!context.baseUrl,
	});

	const template = useMemo(
		() => templateResponse as TemplateResponseV1 | undefined,
		[templateResponse],
	);

	const handleViewDetails = (template: TemplateResource) => {
		setSelectedTemplate(template);
	};

	const handleBackToList = () => {
		setSelectedTemplate(null);
		setSelectedTemplateName(null);
	};

	const getTemplateSource = (templateName: string) => {
		setSelectedTemplateName(templateName);
	};

	return {
		templates,
		selectedTemplate,
		template,
		isLoading,
		isTemplateLoading,
		error,
		templateError,
		handleViewDetails,
		handleBackToList,
		getTemplateSource,
	};
}

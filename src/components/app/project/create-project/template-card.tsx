import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { TemplateResource } from "@/lib/sealos/template/schemas/template-api-context-schemas";

export type TemplateCardProps = {
  template: TemplateResource;
  onSelectCategory: (category: string) => void;
  onDeploy: (templateName: string) => void;
  onViewDetails: (template: TemplateResource) => void;
};

export function TemplateCard({
  template,
  onSelectCategory,
  onDeploy,
  onViewDetails,
}: TemplateCardProps) {
  const handleClick = () => onViewDetails(template);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onViewDetails(template);
    }
  };

  return (
    <button
      className="cursor-pointer rounded-lg border p-4 transition-shadow hover:shadow-md"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      type="button"
    >
      <div className="mb-8 flex items-center justify-between">
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted p-2">
          {template.spec.icon ? (
            <Image
              alt={`${template.spec.title} icon`}
              className="size-6"
              height={24}
              src={template.spec.icon}
              width={24}
            />
          ) : (
            <div className="size-6 rounded bg-gray-300" />
          )}
        </div>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onDeploy(template.metadata.name);
          }}
          size="sm"
          variant="outline"
        >
          Deploy
        </Button>
      </div>
      <div>
        <h2 className="mb-1 font-semibold">{template.spec.title}</h2>
        <p className="line-clamp-2 text-gray-500">
          {template.spec.description || "No description available"}
        </p>
        {template.spec.categories && template.spec.categories.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {template.spec.categories.slice(0, 3).map((category: string) => (
              <button
                className="cursor-pointer rounded-full border-none bg-gray-100 px-2 py-1 text-gray-700 text-xs hover:bg-gray-200"
                key={category}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCategory(category);
                }}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

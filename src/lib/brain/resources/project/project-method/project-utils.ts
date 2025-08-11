import {
  ProjectObjectMetadataSchema,
  ProjectObjectMetadata,
} from "@/lib/brain/resources/project/project-schemas/project-object-schema";

export const composeProjectMetadata = (): ProjectObjectMetadata => {
  return ProjectObjectMetadataSchema.parse({
    compatibility: "brain",
    resources: [],
  });
};

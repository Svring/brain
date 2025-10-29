"use client";

import { CircleCheckBigIcon, Container, Hammer, Rocket } from "lucide-react";
import { usePathname } from "next/navigation";
import type React from "react";
import { ProjectProposalCard } from "@/components/chat/state-cards/project-proposal/project-proposal-card";
import { useHomeChat } from "@/components/provider/home-chat-provider";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useImageDeployment } from "@/hooks/langgraph/use-image-deployment";
import { requestLogin } from "@/lib/auth/auth-utils";

interface ProposeImageDeploymentMessageProps {
	args: {
		image_name: string;
		project_name: string;
		name: string;
		ports?: number[];
	};
	result?: any;
	onSuccess?: (data: any) => void;
}

const ImageDeploymentSuccessMessage = ({ args }: { args: any }) => {
	return (
		<div className="w-full">
			<div className="flex items-center justify-center p-2 border rounded-lg">
				<div className="flex items-center gap-2">
					<CircleCheckBigIcon className="h-4 w-4 text-green-600" />
					<p className="text-sm">
						Image "{args.image_name}" deployed successfully
					</p>
				</div>
			</div>
		</div>
	);
};

const ImageDeploymentCard = ({
	args,
	onSuccess,
}: {
	args: any;
	onSuccess?: (data: any) => void;
}) => {
	const { sessionId } = useHomeChat();
	const { internalProposal, setInternalProposal, deployImage, isCreating } =
		useImageDeployment(args);

	const handleDeploy = async () => {
		// If sessionId is present, request login instead of creating project
		if (sessionId) {
			const queryString = `sessionId=${sessionId}&args=${encodeURIComponent(JSON.stringify(args))}`;
			console.log(queryString);
			requestLogin({
				pathname: "/",
				query: queryString,
			});
			return;
		}

		try {
			const projectName = await deployImage();
			if (onSuccess) {
				onSuccess(projectName);
			}
		} catch (error) {
			console.error(
				"[ProposeImageDeploymentMessage] Failed to deploy Docker image:",
				error,
			);
		}
	};

	return (
		<div className="w-full border p-2 rounded-xl">
			{/* Header with icon and text */}
			{/* <div className="flex items-center mb-3">
        <div className="flex text-sm text-muted-foreground">
          <Hammer size={20} className="mr-2" />
          <span>
            Deploy {args.name} ({args.image_name})
          </span>
        </div>
      </div> */}

			<ProjectProposalCard
				proposal={internalProposal}
				onProposalUpdate={setInternalProposal}
			/>

			<div className="pt-2">
				<Button
					onClick={handleDeploy}
					disabled={isCreating}
					className="w-full"
					// variant={"outline"}
				>
					{isCreating ? (
						<>
							<Spinner variant="circle" size={16} className="mr-2" />
							Deploying...
						</>
					) : (
						<>
							<Rocket className="h-4 w-4 mr-2" />
							Deploy
						</>
					)}
				</Button>
			</div>
		</div>
	);
};

export const ProposeImageDeploymentMessage: React.FC<
	ProposeImageDeploymentMessageProps
> = ({ args, result, onSuccess }) => {
	const pathname = usePathname();

	// If we are on a project page, always show success message
	if (pathname?.includes("/projects")) {
		return <ImageDeploymentSuccessMessage args={args} />;
	}
	// Check result first and return success state if it exists
	if (result) {
		return <ImageDeploymentSuccessMessage args={args} />;
	}

	// Return the card component with args and logic
	return <ImageDeploymentCard args={args} onSuccess={onSuccess} />;
};

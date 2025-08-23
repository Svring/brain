"use client";

import { Plus } from "lucide-react";
import { useEffect } from "react";
import ProjectCard from "@/components/project/project-card";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/ui/search-bar";
import useProjectSearch from "@/hooks/brain/use-projects-search";
import { useProjectCreateDialog } from "@/hooks/brain/use-project-create-dialog";
import { useProjectActions } from "@/contexts/project/project-context";
import { Spinner } from "@/components/ui/spinner";
import { ProjectProposalDemo } from "@/components/chat/state-cards/project-proposal-demo";

import { getLaunchpad } from "@/lib/sealos/resources/launchpad/launchpad-method/launchpad-query";
import {
  updateApplication,
  updateApplicationPorts,
} from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-open-api";

import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { createK8sContext, createSealosContext } from "@/lib/auth/auth-utils";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { runParallelAction } from "next-server-actions-parallel";

export default function Page() {
  // const { openDialog, CreateProjectDialog } = useProjectCreateDialog();
  const { setAllProjects } = useProjectActions();
  // const { launchpad } = useTRPCClients();
  // const context = createK8sContext();
  // const sealosContext = createSealosContext();

  const { setSearchTerm, filteredProjects, projects, isLoading, isError } =
    useProjectSearch();

  // Update the global project context with all projects when they're loaded
  useEffect(() => {
    if (!isLoading && !isError && projects) {
      setAllProjects(projects);
    }
  }, [projects]);

  // useEffect(() => {
  //   const fetchProjects = async () => {
  //     // const projects = await getLaunchpad(
  //     //   context,
  //     //   convertResourceTypeToTarget(
  //     //     "deployment",
  //     //     "hello-world"
  //     //   ) as BuiltinResourceTarget
  //     // );
  //     const res = await runParallelAction(
  //       // updateApplication(sealosContext, "hello-world", {
  //       // image: "cat",
  //       // resource: {
  //       //   cpu: 600,
  //       //   memory: 1024,
  //       // },
  //       // env: [
  //       //   {
  //       //     name: "hello",
  //       //     value: "8081",
  //       //   },
  //       // ],
  //       // })
  //       // updateApplicationPorts(sealosContext, "hello-world", {
  //       //   ports: [
  //       //     {
  //       //       port: 81,
  //       //       protocol: "TCP",
  //       //       exposesPublicDomain: true,
  //       //     },
  //       //     {
  //       //       port: 82,
  //       //       protocol: "TCP",
  //       //       appProtocol: "HTTP",
  //       //       exposesPublicDomain: false,
  //       //     },
  //       //   ],
  //       // })
  //     );
  //     console.log(res);
  //   };
  //   fetchProjects();
  // }, []);

  return (
    <div className="flex min-h-screen w-full flex-col items-center p-8">
      {/* Header */}
      <div className="mb-8 flex w-4xl">
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <h1 className="rounded-md px-3 py-1 font-semibold text-lg">
              Projects
            </h1>
          </div>
          {/* Search bar and plus button in the same row */}
          <div className="flex items-center gap-3">
            <SearchBar
              onSearchChange={setSearchTerm}
              placeholder="Search projects..."
            />
            {/* <Button variant="ghost" onClick={openDialog}>
              <Plus />
            </Button> */}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-4xl">
        <div className="grid grid-cols-3 gap-6">
          {isLoading && (
            <div className="col-span-full flex h-32 items-center justify-center">
              <Spinner variant="bars" size={24} />
            </div>
          )}

          {isError && (
            <div className="col-span-full flex h-32 items-center justify-center">
              <div className="text-destructive">Error loading projects</div>
            </div>
          )}

          {!isError && (
            <>
              {filteredProjects.length !== 0 &&
                filteredProjects.map((project: any) => (
                  <ProjectCard key={project.name} project={project} />
                ))}
            </>
          )}
        </div>
      </div>

      {/* <ProjectProposalDemo /> */}
      {/* <CreateProjectDialog /> */}
    </div>
  );
}

"use client";

import { HelpCircle, Sparkles } from "lucide-react";
import { useQuota } from "@/components/provider/quota-provider";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { openCostCenterApp } from "@/lib/auth/auth-utils";
import { cn } from "@/lib/utils";
import { MainSection } from "./sidebar-section";

export default function AppSidebar() {
	// Use quota provider for all quota-related data and logic
	const { cpu, memory, storage, ports, balance, isLoading } = useQuota();

	// Get sidebar state for tooltip visibility
	const { state, isMobile } = useSidebar();

	return (
		<>
			<Sidebar className="" collapsible="icon">
				<SidebarHeader className={cn("bg-background-primary pt-3")}>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton
								className="group-data-[collapsible=icon]:justify-center p-0 border-border-primary hover:bg-transparent!"
								size="lg"
								// tooltip={{
								//   children: "Sealos Brain",
								// }}
							>
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg grayscale">
									<img
										src="/sealos-brain-icon-grayscale.svg"
										className="grayscale"
										alt="Sealos Brain"
										width={32}
										height={32}
									/>
								</div>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>
				{/* <SidebarSeparator /> */}
				<SidebarContent className={cn("bg-background-primary")}>
					<MainSection />
				</SidebarContent>
				<SidebarFooter className={cn("bg-background-primary")}>
					<div className="flex flex-col gap-2">
						<Popover>
							<PopoverTrigger asChild>
								<div className="cursor-pointer">
									{state === "collapsed" && !isMobile ? (
										<Tooltip>
											<TooltipTrigger asChild>
												<div className="flex aspect-square size-8 items-center justify-center rounded-md hover:bg-muted transition-colors duration-200">
													<Sparkles className="h-4 w-4" />
												</div>
											</TooltipTrigger>
											<TooltipContent
												align="center"
												side="right"
												sideOffset={16}
											>
												Quota
											</TooltipContent>
										</Tooltip>
									) : (
										<div className="flex aspect-square size-8 items-center justify-center rounded-md hover:bg-muted transition-colors duration-200">
											<Sparkles className="h-4 w-4" />
										</div>
									)}
								</div>
							</PopoverTrigger>
							<PopoverContent
								align="end"
								side="right"
								sideOffset={16}
								className="rounded-lg bg-background-secondary border border-border-primary w-80"
							>
								<div className="space-y-4">
									{isLoading ? (
										<div className="space-y-2">
											<Skeleton className="h-4 w-full" />
											<Skeleton className="h-2 w-full" />
											<Skeleton className="h-4 w-3/4" />
										</div>
									) : cpu ? (
										<div className="space-y-4">
											{/* Account Balance - Show remaining balance / total balance */}
											{balance && (
												<div className="space-y-2 rounded-lg">
													<div className="flex justify-between text-xs">
														<div className="flex items-center gap-1">
															<span className="text-muted-foreground">
																Account Balance
															</span>
															<Tooltip>
																<TooltipTrigger asChild>
																	<HelpCircle className="h-3 w-3 text-muted-foreground hover:text-foreground transition-colors" />
																</TooltipTrigger>
																<TooltipContent side="top" className="max-w-xs">
																	<p className="text-sm">
																		Sealos Brain requires an API key to
																		function. Click to check{" "}
																		<a
																			href="https://sealos.io/docs/msa/terms-of-service"
																			target="_blank"
																			rel="noopener noreferrer"
																			className="underline hover:text-primary"
																		>
																			Our Terms of Service
																		</a>
																	</p>
																</TooltipContent>
															</Tooltip>
														</div>
														<span className="text-foreground font-medium">
															{balance.used === balance.limit
																? `${balance.limit.toFixed(2)} USD`
																: `${balance.used.toFixed(2)} / ${balance.limit.toFixed(2)} USD`}
														</span>
													</div>
												</div>
											)}

											{/* Resource Quotas - 2x2 Grid */}
											<div className="grid grid-cols-2 gap-3">
												<div className="flex justify-between text-xs">
													<span className="text-muted-foreground">CPU</span>
													<span className="text-primary">
														{cpu?.used.toFixed(1)}/{cpu?.limit}
													</span>
												</div>
												<div className="flex justify-between text-xs">
													<span className="text-muted-foreground">Memory</span>
													<span className="text-primary">
														{memory?.used.toFixed(1)}/{memory?.limit}
													</span>
												</div>
												<div className="flex justify-between text-xs">
													<span className="text-muted-foreground">Storage</span>
													<span className="text-primary">
														{storage?.used}/{storage?.limit}
													</span>
												</div>
												<div className="flex justify-between text-xs">
													<span className="text-muted-foreground">Ports</span>
													<span className="text-primary">
														{ports?.used}/{ports?.limit}
													</span>
												</div>
											</div>
										</div>
									) : (
										<div className="space-y-2">
											<p className="text-sm text-muted-foreground">
												Resource information is temporarily unavailable.
											</p>
										</div>
									)}
									<Button
										className="w-full"
										size="sm"
										onClick={() => openCostCenterApp()}
										disabled={isLoading}
									>
										Upgrade
									</Button>
								</div>
							</PopoverContent>
						</Popover>
					</div>
				</SidebarFooter>
			</Sidebar>
		</>
	);
}

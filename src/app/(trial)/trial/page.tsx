"use client";

import { useQueryState } from "nuqs";
import { TrialLanding } from "./trial-landing";
import { TrialWithQuery } from "./trial-with-query";

export default function Page() {
	const [query] = useQueryState("query");

	// Conditionally render based on presence of query parameter
	if (query?.trim()) {
		return <TrialWithQuery query={query} />;
	}

	return <TrialLanding />;
}

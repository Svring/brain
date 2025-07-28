// import { useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import { listDevboxOptions } from "@/lib/sealos/devbox/devbox-method/devbox-query";
// import { createDevboxContext } from "@/lib/sealos/devbox/devbox-utils";

// export function DevboxListCard() {
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;
//   const context = createDevboxContext();

//   const {
//     data: devboxListData,
//     isLoading,
//     error,
//   } = useQuery(listDevboxOptions(context));

//   if (isLoading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error loading DevBoxes</div>;
//   }

//   const devboxes = devboxListData?.data || [];

//   // Pagination logic
//   const totalPages = Math.ceil(devboxes.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;
//   const currentDevboxes = devboxes.slice(startIndex, endIndex);

//   const handlePreviousPage = () => {
//     setCurrentPage((prev) => Math.max(prev - 1, 1));
//   };

//   const handleNextPage = () => {
//     setCurrentPage((prev) => Math.min(prev + 1, totalPages));
//   };

//   return (
//     <div className="space-y-4">
//       <Table>
//         <TableHeader>
//           <TableRow className="h-6">
//             <TableHead className="">Name</TableHead>
//             <TableHead className="">Created At</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {currentDevboxes.length === 0 ? (
//             <TableRow className="h-8">
//               <TableCell
//                 colSpan={2}
//                 className="text-center text-muted-foreground py-2"
//               >
//                 No DevBoxes found
//               </TableCell>
//             </TableRow>
//           ) : (
//             currentDevboxes.map((devbox: any, index: number) => (
//               <TableRow key={devbox.name || index} className="h-8">
//                 <TableCell className="font-medium py-2">
//                   {devbox.name}
//                 </TableCell>
//                 <TableCell className="py-2">
//                   {/* <Badge className="text-xs px-2 py-0.5"> */}
//                   {devbox.createTime}
//                   {/* </Badge> */}
//                 </TableCell>
//               </TableRow>
//             ))
//           )}
//         </TableBody>
//       </Table>

//       {totalPages > 1 && (
//         <div className="flex items-center justify-between">
//           <div className="text-sm text-muted-foreground">
//             Showing {startIndex + 1} to {Math.min(endIndex, devboxes.length)} of{" "}
//             {devboxes.length} DevBoxes
//           </div>
//           <div className="flex items-center gap-2">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={handlePreviousPage}
//               disabled={currentPage === 1}
//             >
//               <ChevronLeft className="h-4 w-4" />
//               Previous
//             </Button>
//             <span className="text-sm">
//               Page {currentPage} of {totalPages}
//             </span>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={handleNextPage}
//               disabled={currentPage === totalPages}
//             >
//               Next
//               <ChevronRight className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

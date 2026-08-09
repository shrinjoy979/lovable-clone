// import { Button, Card, Input, Textarea } from "@repo/ui";

// export default function Home() {
//   return (
//     <main className="mx-auto max-w-2xl space-y-6 p-10">
//       <Card>
//         <h1 className="mb-4 text-2xl font-bold">
//           Lovable Clone
//         </h1>

//         <Input placeholder="Enter your name" />

//         <div className="my-4" />

//         <Textarea placeholder="Type your message..." />

//         <div className="mt-4 flex gap-2">
//           <Button>Primary</Button>

//           <Button variant="secondary">
//             Secondary
//           </Button>

//           <Button variant="ghost">
//             Ghost
//           </Button>
//         </div>
//       </Card>
//     </main>
//   );
// }

import { ChatWindow } from "./components/chat";

export default function HomePage() {
  return <ChatWindow />;
}
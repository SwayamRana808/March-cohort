import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard"); // Server-side redirection
  return null;
}

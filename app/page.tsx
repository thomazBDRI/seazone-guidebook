import { getMessages } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export default async function Home() {
  const messages = getMessages(await getLocale()).home;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-2xl font-bold">{messages.title}</h1>
      <p className="text-sm opacity-70">
        {messages.hint}{" "}
        <span className="whitespace-nowrap">
          ({messages.example} <code>/FLN001</code>)
        </span>
      </p>
    </main>
  );
}

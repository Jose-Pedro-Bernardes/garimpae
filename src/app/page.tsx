import { Search } from "@/components/search/search";

export default function Home() {
  return (
    <div className="flex flex-1 items-start justify-center px-4 py-6 font-sans sm:py-16">
      <main className="w-full max-w-3xl rounded-2xl border border-border bg-background/85 p-5 shadow-sm backdrop-blur-sm sm:p-10">
        <Search />
      </main>
    </div>
  );
}

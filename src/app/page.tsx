import { Search } from "@/components/search/search";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-background font-sans">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center px-4 py-10 sm:items-start sm:px-16 sm:py-32">
        <Search />
      </main>
    </div>
  );
}

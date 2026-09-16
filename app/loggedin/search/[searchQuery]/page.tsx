import SearchResults from "@/components/containers/search-results";

export default function SearchResultsPage({
  params,
}: {
  params: { searchQuery: string };
}) {
  return <SearchResults query={params.searchQuery} />;
}
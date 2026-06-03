export interface StatisticsResponse {
  totalBooksAmount: number;
  totalMembers: number;
  booksRented: number;
  booksInStock: number;
  mostPopularBook: string;
  userCount: number;
  newMembers: number;
  newBooks: number;
  mostPopularCategory: string;
  returnDelayed: number;
}

export async function getStatistics(from: Date, to: Date): Promise<StatisticsResponse | null> {
  const response = await fetch("/api/statistics", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: from.toISOString(), to: to.toISOString() }),
  });

  if (!response.ok) return null;
  return response.json();
}

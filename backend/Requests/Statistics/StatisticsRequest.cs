namespace LibraryPlus.Requests.Statistics;

public record StatisticsRequest(
    DateTime From,
    DateTime To
);

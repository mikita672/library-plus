import { Publisher } from "@/types/book/Publisher";
import PublisherFilterRadioGroup from "./PublisherFilterSelection";

async function PublisherFilter() {
    const response = await fetch(`${process.env.API_URL}/publishers`, {
        method: "GET",
    });

    if (!response.ok) {
        return <div className="text-destructive">Failed to fetch publishers</div>
    }

    const publishers: Publisher[] = await response.json();

    if (publishers.length === 0) {
        return <></>;
    }

    return (
        <div className="flex flex-col gap-1">
            <p>Publisher</p>

            <PublisherFilterRadioGroup publishers={publishers} />
        </div>
    )
}

export default PublisherFilter
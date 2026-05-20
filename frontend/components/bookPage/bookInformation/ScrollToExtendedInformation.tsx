"use client"

function ScrollToExtendedInformation() {
    return (
        <p
            className="text-primary underline cursor-pointer"
            onClick={() => {
                document.getElementById("book-extended-information")?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }}
        >More information</p>
    )
}

export default ScrollToExtendedInformation
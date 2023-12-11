export async function fetchData(
  endpoint: string,
  id: number,
  pageNumber: number,
) {
  const { html, success } = await fetch(
    endpoint
      .replace("REQUIRED_ID", id.toString())
      .replace("PAGE_NUMBER", pageNumber.toString()),
    {
      method: "GET",
    },
  ).then(async (response) => {
    return {
      html: await response.text(),
      success: response.status === 200,
    };
  });

  return { html, success };
}

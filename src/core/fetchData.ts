export async function fetchData(
  endpoint: string,
  id: number,
  pageNumber: number,
) {
  const { html, success, status } = await fetch(
    endpoint
      .replace("REQUIRED_ID", id.toString())
      .replace("PAGE_NUMBER", pageNumber.toString()),
    {
      method: "GET",
      // todo: подумать как достать этот кук, без браузера
      // headers: {
      //   Cookie: "__qca=P0-487207720-1702503572738;",
      // },
    },
  ).then(async (response) => {
    // todo: remove log
    // console.log(response.status);
    return {
      html: await response.text(),
      status: response.status,
      success: response.status === 200,
    };
  });

  return { html, success, status };
}

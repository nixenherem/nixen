const AREDL_URL = "https://api.aredl.net/v2/api/aredl/levels/";

export async function onRequestGet() {
  try {
    const response = await fetch(AREDL_URL, {
      headers: {
        Accept: "application/json",
        "User-Agent": "nixen.pages.dev demon list"
      }
    });

    if (!response.ok) {
      return Response.json(
        {
          error: "AREDL returned an error",
          status: response.status
        },
        { status: 502 }
      );
    }

    const body = await response.text();

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=300"
      }
    });
  } catch {
    return Response.json(
      { error: "Could not reach AREDL" },
      { status: 502 }
    );
  }
}

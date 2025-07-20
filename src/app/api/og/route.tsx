import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    const shared = searchParams.get("shared");

    // Handle shared profile case
    if (shared === "true") {
      return new ImageResponse(
        (
          <div
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#0d1117",
              backgroundImage:
                "linear-gradient(45deg, #0d1117 0%, #21262d 100%)",
              fontSize: 50,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 30,
                fontSize: 60,
              }}
            >
              📊 GitHub Profile Shared
            </div>
            <div
              style={{
                fontSize: 28,
                color: "#7c3aed",
                textAlign: "center",
                maxWidth: "80%",
              }}
            >
              View this amazing GitHub contribution visualization
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    // Return default OG if no username
    if (!username) {
      return new ImageResponse(
        (
          <div
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#0d1117",
              backgroundImage:
                "linear-gradient(45deg, #0d1117 0%, #21262d 100%)",
              fontSize: 60,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              📊 Git Aura - Flex your GitHub Aura
            </div>
            <div
              style={{
                fontSize: 30,
                color: "#58a6ff",
                textAlign: "center",
              }}
            >
              Beautiful Git Aura profile visualization
            </div>
            <div
              style={{
                fontSize: 24,
                color: "#7c3aed",
                marginTop: 20,
                textAlign: "center",
              }}
            >
              Analyze contributions • View stats • Share profiles
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    // Return personalized OG for a specific username
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0d1117",
            backgroundImage: "linear-gradient(45deg, #0d1117 0%, #21262d 100%)",
            fontSize: 60,
            fontWeight: 700,
            color: "#fff",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 20,
              fontSize: 50,
            }}
          >
            🚀 {username}'s GitHub Profile
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#58a6ff",
              textAlign: "center",
            }}
          >
            Contributions • Repositories • Statistics
          </div>
          <div
            style={{
              fontSize: 20,
              color: "#7c3aed",
              marginTop: 20,
              textAlign: "center",
            }}
          >
            Powered by GitAura
          </div>

          {/* Decorative elements */}
          <div
            style={{
              position: "absolute",
              top: 40,
              right: 60,
              width: 120,
              height: 120,
              backgroundColor: "#21262d",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 60,
            }}
          >
            📈
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 40,
              left: 60,
              width: 100,
              height: 100,
              backgroundColor: "#21262d",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 50,
            }}
          >
            ⭐
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error: any) {
    console.log(`${error.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}

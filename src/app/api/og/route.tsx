import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    const shared = searchParams.get("shared");
    const ogImage = searchParams.get("og_image");

    // If a custom OG image is provided, redirect to it
    if (ogImage) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: ogImage,
        },
      });
    }

    // Default OG image for the homepage
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
                "radial-gradient(circle at 25% 25%, #1f2937 0%, #0d1117 50%)",
            }}
          >
            {/* Logo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                G
              </div>
              <div
                style={{
                  fontSize: "48px",
                  fontWeight: "bold",
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                GitAura
              </div>
            </div>

            {/* Tagline */}
            <div
              style={{
                fontSize: "32px",
                fontWeight: "600",
                color: "#f3f4f6",
                textAlign: "center",
                marginBottom: "16px",
                maxWidth: "600px",
              }}
            >
              Flex your GitHub Aura
            </div>

            {/* Description */}
            <div
              style={{
                fontSize: "20px",
                color: "#9ca3af",
                textAlign: "center",
                maxWidth: "500px",
                lineHeight: "1.5",
              }}
            >
              Track contributions, calculate aura scores, and compete on
              leaderboards
            </div>

            {/* Features */}
            <div
              style={{
                display: "flex",
                gap: "24px",
                marginTop: "32px",
              }}
            >
              {["Profile Compare", "Aura Tracking", "Leaderboards"].map(
                (feature) => (
                  <div
                    key={feature}
                    style={{
                      padding: "12px 20px",
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      borderRadius: "12px",
                      fontSize: "16px",
                      color: "#3b82f6",
                      fontWeight: "500",
                    }}
                  >
                    {feature}
                  </div>
                )
              )}
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    // Fetch user data for personalized OG image
    let userData = null;
    try {
      const response = await fetch(`https://api.github.com/users/${username}`, {
        headers: {
          "User-Agent": "GitAura-App",
          ...(process.env.GITHUB_TOKEN && {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          }),
        },
      });

      if (response.ok) {
        userData = await response.json();
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }

    // Personalized OG image for user profiles
    if (userData) {
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
                "radial-gradient(circle at 25% 25%, #1f2937 0%, #0d1117 50%)",
              padding: "40px",
            }}
          >
            {/* Header with logo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "40px",
                alignSelf: "flex-start",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                G
              </div>
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#9ca3af",
                }}
              >
                GitAura
              </span>
            </div>

            {/* User Profile Section */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "32px",
                marginBottom: "40px",
              }}
            >
              {/* Avatar */}
              <img
                src={userData.avatar_url}
                alt={userData.login}
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "60px",
                  border: "4px solid #374151",
                }}
              />

              {/* User Info */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "48px",
                    fontWeight: "bold",
                    color: "#f3f4f6",
                  }}
                >
                  {userData.name || userData.login}
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    color: "#9ca3af",
                  }}
                >
                  @{userData.login}
                </div>
                {userData.bio && (
                  <div
                    style={{
                      fontSize: "18px",
                      color: "#d1d5db",
                      maxWidth: "400px",
                      lineHeight: "1.4",
                    }}
                  >
                    {userData.bio}
                  </div>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "24px",
                width: "100%",
                maxWidth: "800px",
              }}
            >
              {[
                { label: "Repositories", value: userData.public_repos },
                { label: "Followers", value: userData.followers },
                { label: "Following", value: userData.following },
                { label: "Gists", value: userData.public_gists },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "20px",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    borderRadius: "16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "32px",
                      fontWeight: "bold",
                      color: "#3b82f6",
                      marginBottom: "8px",
                    }}
                  >
                    {stat.value.toLocaleString()}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#9ca3af",
                      textAlign: "center",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Call to Action */}
            <div
              style={{
                marginTop: "40px",
                padding: "16px 32px",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                border: "2px solid #3b82f6",
                borderRadius: "12px",
                fontSize: "18px",
                color: "#3b82f6",
                fontWeight: "600",
              }}
            >
              View Full Profile on GitAura
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    // Fallback OG image if user data fetch fails
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
              "radial-gradient(circle at 25% 25%, #1f2937 0%, #0d1117 50%)",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: "#f3f4f6",
              marginBottom: "16px",
            }}
          >
            @{username}
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#9ca3af",
              marginBottom: "32px",
            }}
          >
            GitHub Profile on GitAura
          </div>
          <div
            style={{
              fontSize: "18px",
              color: "#6b7280",
            }}
          >
            Track contributions and calculate aura scores
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    const errorMessage =
      e instanceof Error ? e.message : "Unknown error occurred";
    console.log(errorMessage);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}

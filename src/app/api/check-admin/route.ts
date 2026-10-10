import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { isUserAdmin } from "@/lib/utils";

// Admin status is decided only from the signed-in session — never from
// client-supplied identifiers — so it can't be used to probe who the admins are.
export async function POST() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ isAdmin: false });
    }

    const primaryEmail = user.emailAddresses?.find(
      (email) => email.id === user.primaryEmailAddressId
    )?.emailAddress;
    const githubUsername =
      user.externalAccounts?.find((account) => account.provider === "github")
        ?.username ?? user.username;

    return NextResponse.json({ isAdmin: isUserAdmin(primaryEmail, githubUsername) });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json({ isAdmin: false });
  }
}

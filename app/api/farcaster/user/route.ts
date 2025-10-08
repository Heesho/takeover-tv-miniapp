import { NextRequest, NextResponse } from 'next/server';

interface NeynarUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  verified_addresses?: {
    eth_addresses?: string[];
  };
}

interface NeynarResponse {
  [address: string]: NeynarUser[];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: 'Address parameter is required' },
      { status: 400 }
    );
  }

  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) {
    console.error('NEYNAR_API_KEY is not configured');
    return NextResponse.json(
      { error: 'Farcaster API not configured' },
      { status: 500 }
    );
  }

  try {
    // Normalize address to lowercase for consistent matching
    const normalizedAddress = address.toLowerCase();

    // Fetch user by verified Ethereum address from Neynar
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${normalizedAddress}`,
      {
        headers: {
          accept: 'application/json',
          api_key: apiKey,
        },
        // Cache for 5 minutes to reduce API calls
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Neynar API error ${response.status}:`, errorText);
      // If it's a 404 or the user doesn't exist, return null instead of error
      if (response.status === 404) {
        return NextResponse.json({ user: null });
      }
      throw new Error(`Neynar API error: ${response.status}`);
    }

    const data: NeynarResponse = await response.json();
    console.log('Neynar API response:', JSON.stringify(data, null, 2));

    // The response is an object with addresses as keys
    // Get the array of users for our address
    const users = data[normalizedAddress];

    // Check if we got any users back
    if (!users || users.length === 0) {
      return NextResponse.json({ user: null });
    }

    // Return the first user found for this address
    const user = users[0];
    return NextResponse.json({
      user: {
        fid: user.fid,
        username: user.username,
        displayName: user.display_name,
        pfpUrl: user.pfp_url,
        verifiedAddresses: user.verified_addresses?.eth_addresses || [],
      },
    });
  } catch (error) {
    console.error('Error fetching Farcaster user by address:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

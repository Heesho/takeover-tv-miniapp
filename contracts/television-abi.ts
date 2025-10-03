export const televisionABI = [
  {
    type: 'function',
    name: 'takeover',
    inputs: [
      { name: 'uri', type: 'string', internalType: 'string' },
      { name: 'channelOwner', type: 'address', internalType: 'address' },
      { name: 'epochId', type: 'uint256', internalType: 'uint256' },
      { name: 'deadline', type: 'uint256', internalType: 'uint256' },
      { name: 'maxPaymentAmount', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [{ name: 'paymentAmount', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getSlot0',
    inputs: [],
    outputs: [
      { name: '', type: 'tuple', internalType: 'struct Television.Slot0', components: [
        { name: 'locked', type: 'uint8', internalType: 'uint8' },
        { name: 'epochId', type: 'uint16', internalType: 'uint16' },
        { name: 'initPrice', type: 'uint192', internalType: 'uint192' },
        { name: 'startTime', type: 'uint40', internalType: 'uint40' },
        { name: 'owner', type: 'address', internalType: 'address' },
        { name: 'uri', type: 'string', internalType: 'string' },
      ]},
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPrice',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'quote',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'Television__Takeover',
    inputs: [
      { name: 'from', type: 'address', indexed: true, internalType: 'address' },
      { name: 'channelOwner', type: 'address', indexed: true, internalType: 'address' },
      { name: 'paymentAmount', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
    anonymous: false,
  },
] as const;

export const erc20ABI = [
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address', internalType: 'address' },
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      { name: 'owner', type: 'address', internalType: 'address' },
      { name: 'spender', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ name: '', type: 'uint8', internalType: 'uint8' }],
    stateMutability: 'view',
  },
] as const;

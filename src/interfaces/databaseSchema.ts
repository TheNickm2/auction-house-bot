export interface AuctionLot {
  messageId: string;
  index: number;
  title?: string;
  description?: string;
  imageUrl?: string;
  startingBid?: number;
  currentBid?: number;
  currentLeaderId?: string;
  paid?: boolean;
  sent?: boolean;
}
export interface AuctionInfo {
  end?: string;
  isOpen?: boolean;
}
export interface Bid {
  messageId: string;
  userId?: string;
  bidValue?: number;
  timestamp?: string;
  requestId: string;
}

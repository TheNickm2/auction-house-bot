import mongoose from 'mongoose';
import { AuctionLot, AuctionInfo, Bid } from '@/interfaces';
import * as DotEnv from 'dotenv';
import dayjs from 'dayjs';

// Initialize DotEnv config
DotEnv.config();

export class Database {
  private static isInitalized = false;
  private static AuctionLotModel: mongoose.Model<AuctionLot> | null = null;
  private static AuctionInfoModel: mongoose.Model<AuctionInfo> | null = null;
  private static BidInfoModel: mongoose.Model<Bid> | null = null;
  private static async init() {
    if (!this.isInitalized) {
      // default connection string = standard local mongodb install
      await mongoose.connect(
        process.env.MONGO_CONNECTION_STRING ?? 'mongodb://localhost:27017'
      );

      const auctionLotSchema = new mongoose.Schema<AuctionLot>({
        messageId: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        imageUrl: String,
        startingBid: { type: Number, required: true },
        currentBid: Number,
        currentLeaderId: String,
        paid: Boolean,
        sent: Boolean,
        index: Number,
      });
      this.AuctionLotModel = mongoose.model<AuctionLot>(
        'AuctionLot',
        auctionLotSchema
      );

      const auctionInfoSchema = new mongoose.Schema<AuctionInfo>({
        end: String,
        isOpen: Boolean,
      });
      this.AuctionInfoModel = mongoose.model<AuctionInfo>(
        'AuctionInfo',
        auctionInfoSchema
      );

      const bidInfoSchema = new mongoose.Schema<Bid>({
        messageId: { type: String, required: true },
        userId: { type: String, required: true },
        bidValue: { type: Number, required: true },
        timestamp: { type: String, required: true },
        requestId: { type: String, required: true },
      });
      this.BidInfoModel = mongoose.model('Bid', bidInfoSchema);

      this.isInitalized = true;
    }
  }

  public static async getAuctionLot(lot: AuctionLot) {
    if (!this.isInitalized) {
      await this.init();
    }
    return await this.AuctionLotModel?.findOne({
      messageId: lot.messageId,
    }).exec();
  }

  public static async getAuctionLots() {
    if (!this.isInitalized) {
      await this.init();
    }
    return await this.AuctionLotModel?.find({}).exec();
  }

  public static async createOrUpdateAuctionLot(lot: AuctionLot) {
    if (!this.isInitalized) {
      await this.init();
    }
    const result = await this.AuctionLotModel?.findOneAndUpdate(
      { messageId: lot.messageId },
      lot
    ).exec();
    if (!result) {
      return await this.AuctionLotModel?.create(lot);
    }
    return result;
  }

  public static async getAuctionInfo() {
    if (!this.isInitalized) {
      await this.init();
    }
    return await this.AuctionInfoModel?.find({}).exec();
  }

  public static async setAuctionInfo(auctionInfo: AuctionInfo) {
    if (!this.isInitalized) {
      await this.init();
    }
    const records = await this.AuctionInfoModel?.find({});
    if (!records || records.length < 1) {
      return await this.AuctionInfoModel?.create(auctionInfo);
    }
    return await records[0].set(auctionInfo).save();
  }

  public static async addBidInfo(bid: Bid) {
    if (!this.isInitalized) {
      await this.init();
    }
    return await this.BidInfoModel?.create(bid);
  }
  public static async findSpecificBid(bid: Bid) {
    if (!this.isInitalized) {
      await this.init();
    }
    return await this.BidInfoModel?.findOne({ ...bid }).exec();
  }

  public static async isAuctionOpen() {
    if (!this.isInitalized) {
      await this.init();
    }
    const auctionInfo = await this.AuctionInfoModel?.find({}).exec();
    if (auctionInfo && auctionInfo.length) {
      return Boolean(auctionInfo[0].isOpen);
    }
    return false;
  }

  public static async dropAuctionLots() {
    if (!this.isInitalized) {
      await this.init();
    }
    return await this.AuctionLotModel?.deleteMany({}).exec();
  }

  public static async getAuctionEnd() {
    if (!this.isInitalized) {
      await this.init();
    }

    const auctionInfo = await this.AuctionInfoModel?.find({}).exec();
    if (auctionInfo && auctionInfo.length && auctionInfo[0]?.end) {
      return dayjs.unix(Number(auctionInfo[0].end));
    }

    return null;
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReviewStatus } from 'src/common/enums';
import { Product, Review, User } from 'src/entities';
import { Repository } from 'typeorm';
import { CreateReviewInput, ModerateReviewInput, ReviewFilterInput } from './review.inputs';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async createReview(input: CreateReviewInput, user: User): Promise<Review> {
    const product = await this.productsRepository.findOne(input.productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existing = await this.reviewsRepository.findOne({
      where: { product, user },
    });

    if (existing) {
      throw new BadRequestException('You already reviewed this product');
    }

    return this.reviewsRepository.save(
      this.reviewsRepository.create({
        product,
        user,
        rating: input.rating,
        comment: input.comment,
        status: ReviewStatus.PENDING,
      }),
    );
  }

  async listReviews(filter: ReviewFilterInput): Promise<Review[]> {
    const where = filter.status
      ? { product: { id: filter.productId }, status: filter.status }
      : { product: { id: filter.productId }, status: ReviewStatus.APPROVED };

    return this.reviewsRepository.find({
      where: where as any,
      relations: ['user', 'product'],
      order: { createdAt: 'DESC' },
    });
  }

  async moderateReview(input: ModerateReviewInput): Promise<Review> {
    const review = await this.reviewsRepository.findOne(input.reviewId, {
      relations: ['product'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.status = input.status;
    const saved = await this.reviewsRepository.save(review);

    await this.recomputeAverageRating(saved.product.id);
    return saved;
  }

  private async recomputeAverageRating(productId: number): Promise<void> {
    const product = await this.productsRepository.findOne(productId);
    if (!product) {
      return;
    }

    const approved = await this.reviewsRepository.find({
      where: { product, status: ReviewStatus.APPROVED },
    });

    if (!approved.length) {
      product.averageRating = 0;
    } else {
      product.averageRating = Number(
        (
          approved.reduce((sum, review) => sum + review.rating, 0) / approved.length
        ).toFixed(2),
      );
    }

    await this.productsRepository.save(product);
  }
}

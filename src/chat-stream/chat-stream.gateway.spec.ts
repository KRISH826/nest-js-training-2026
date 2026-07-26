import { Test, TestingModule } from '@nestjs/testing';
import { ChatStreamGateway } from './chat-stream.gateway';

describe('ChatStreamGateway', () => {
  let gateway: ChatStreamGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatStreamGateway],
    }).compile();

    gateway = module.get<ChatStreamGateway>(ChatStreamGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});

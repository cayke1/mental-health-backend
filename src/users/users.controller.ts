import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/CreateUserDto';
import { Public } from 'src/custom/decorators/public.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerImageOptions } from 'src/upload/utils/multer.config';
import { AuthenticatedRequest } from 'src/auth/auth.controller';

class createUserDto {
  email: string;
  password: string;
  name: string;
  role?: 'PATIENT' | 'PROFESSIONAL';
}

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieves a list of all users in the system',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully',
  })
  async findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @ApiOperation({
    summary: 'Create user',
    description: 'Creates a new user in the system',
  })
  @ApiBody({
    type: createUserDto,
    description: 'User data for creation',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  async create(@Body() data: CreateUserDto) {
    return this.usersService.create(data);
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieves a specific user by their ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the user to retrieve',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async findById(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @Post('/upload-image')
  @UseInterceptors(FileInterceptor('file', multerImageOptions))
  async uploadImage(
    @Request() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.uploadImage(file, req.user.sub);
  }
}

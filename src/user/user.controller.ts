import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  CreateClientDTO,
  CreateCoachDTO,
  CreateUserDTO,
} from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { LoginDto } from './dto/log-in.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @Get('client')
  async findClients() {
    return this.userService.findClients();
  }

  @Get('coach')
  async findCoaches() {
    return this.userService.findCoaches();
  }
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.userService.findOne(id);
  }

  @Get('coach/:id')
  async findCoach(@Param('id') id: number) {
    return this.userService.findCoach(id);
  }

  @Get('client/:id')
  async findClient(@Param('id') id: number) {
    return this.userService.findClient(id);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDTO) {
    return this.userService.create(createUserDto);
  }

  @Post('coach/:id')
  async createCoach(
    @Param('id') id: number,
    @Body() createCoachDto: CreateCoachDTO,
  ) {
    return this.userService.createCoach(createCoachDto, id);
  }

  @Post('client/:id')
  async createClient(
    @Body() createClientDto: CreateClientDTO,
    @Param('id') id: number,
  ) {
    return this.userService.createClient(createClientDto, id);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDTO) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.userService.remove(id);
  }

  @Post('login')
  async login(@Body() loginDTO: LoginDto) {
    return this.userService.login(loginDTO);
  }

  @Get('coach/student/:id')
  async getStudentbyId(@Param() id: number) {
    return this.userService.getStudentById(id);
  }

  @Get('userId/activities/:id')
  async getUserActivities(@Param('id') userId: number) {
    return this.userService.getUserActivities(userId);
  }

  @Get('clientId/activities/:id')
  async getUserActivitiesClientId(@Param('id') userId: number) {
    return this.userService.getUserActivitiesClientId(userId);
  }
}

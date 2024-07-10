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
  CreateCoachDTO,
  CreateUserDTO,
} from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { LoginDto } from './dto/log-in.dto';
import { CreateClientDTO } from './dto/create-client.dto';

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
  
  @Get('coach/coachPlan/:coachId')
  async findCoachPlans(@Param('coachId') coachId: number) {
    return this.userService.findCoachPlans(coachId);
  }

  @Get('coach/exercises/:coachId')
  async findCoachExercises(@Param('coachId') coachId: number) {
    return this.userService.findCoachExercises(coachId);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.userService.findOne(id);
  }

  @Get('coach/:id')
  async findCoach(@Param('id') id: number) {
    return this.userService.findCoachByUserId(id);
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

  // Coach register a Client
  @Post('client')
  async createClient(
    @Body() createClientDto: CreateClientDTO,
  ) {
    return this.userService.createStudent(createClientDto);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDTO) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.userService.remove(id);
  }

  @Delete('/client/:id')
  async removeClient(@Param('id') id: number) {
    return this.userService.removeClient(id);
  }

  @Post('login')
  async login(@Body() loginDTO: LoginDto) {
    return this.userService.login(loginDTO);
  }

  @Get('coach/student/:id')
  async getStudentbyId(@Param() id: number) {
    return this.userService.getStudentById(id);
  }

  @Get('coach/allStudents/:id')
  async getAllStudentsByCoach(@Param() id: number) {
    return this.userService.getAllStudentsByCoach(id);
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

import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { LoginController } from './login.controller';

describe('LoginController', () => {
    let controller: LoginController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [LoginController],
        }).compile();

        controller = module.get<LoginController>(LoginController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should verify the password of the user when logging to the admin page', async () => {
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = (value) => {
            expect(value).toBeTruthy();
            return res;
        };

        await controller.verifyLogin({ password: 'poly' }, res);
    });

    it('should verify the password of the user and return false if wrong', async () => {
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = (value) => {
            expect(value).toBeFalsy();
            return res;
        };

        await controller.verifyLogin({ password: 'test' }, res);
    });

    it('should throw a server error', async () => {
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
            return res;
        };
        res.json = (error) => {
            expect(error).toEqual(error.message);
            return res;
        };
        await controller.verifyLogin({ password: 'test' }, res);
    });
});

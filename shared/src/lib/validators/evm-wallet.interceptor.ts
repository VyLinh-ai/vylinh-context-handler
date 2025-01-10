import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { ethers } from 'ethers';

@ValidatorConstraint({ async: false })
export class IsEvmAddressConstraint implements ValidatorConstraintInterface {
  validate(address: string, args: ValidationArguments) {
    // Use ethers.js to validate the Ethereum address
    return ethers.isAddress(address);
  }

  defaultMessage(args: ValidationArguments) {
    return 'The value "$value" is not a valid Ethereum address!';
  }
}

export function IsEvmAddress(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEvmAddressConstraint,
    });
  };
}

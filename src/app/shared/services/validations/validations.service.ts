import { Injectable } from '@angular/core';
import { ERROR_VALIDATIONS } from '@data/constants';

import { ENUM_VALIDATION_OPTIONS } from '@data/enum';
import { IResponseValidation } from '@data/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ValidationsService {

  /**
   * Method that validate each field
   * @param value any
   * @param type ENUM_VALIDATION_OPTIONS
   * @returns 
   */
  validateField(value: any, type: ENUM_VALIDATION_OPTIONS){
   
    switch (type) {
      
      case ENUM_VALIDATION_OPTIONS.USUARIO:
        return this.validateEmail(value);  
        
      case ENUM_VALIDATION_OPTIONS.EMAIL:
        return this.validateEmail(value);  
        
      case ENUM_VALIDATION_OPTIONS.PASSWORD:
        return this.validatePassword(value);  
      
    }

  }


  /**
   * Validate email with pattern
   * @param v any
   * @returns 
   */
  private validateEmail(v: any): IResponseValidation{
    const r: IResponseValidation = { msg: '' , isValid: true };
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/;
    r.isValid = pattern.test(v);
    r.msg = (v === '') ? ERROR_VALIDATIONS.ALERTS.EMAIL_REQUIRED : ERROR_VALIDATIONS.ALERTS.EMAIL_INVALID;
    return r;
  }
  
  
  validatePassword(v: any) : IResponseValidation {
    const r: IResponseValidation = { msg: '' , isValid: true };
    const patterm = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,20}$/;
    r.isValid = patterm.test(v);
    r.msg = (v === '') ? ERROR_VALIDATIONS.ALERTS.PASSWORD_REQUIRED : ERROR_VALIDATIONS.ALERTS.PASSWORD_REQUIRED_PATTERN;
    return r;
  }


  validateUser(v: any) : IResponseValidation {
    const r: IResponseValidation = { msg: '' , isValid: true };
    const patterm = /^(?=.*[a-zA-Z])(?=.*\d).+$/;
    r.isValid = patterm.test(v);
    r.msg = (v === '') ? ERROR_VALIDATIONS.ALERTS.USER_REQUIRED : ERROR_VALIDATIONS.ALERTS.USER_ERROR;
    return r;
  }
  
}

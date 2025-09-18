import { ERROR_VALIDATIONS } from "@data/constants/errors/errors-validations.const"
import { IMAGE_ROUTES } from "@data/constants/routes/images.routes"
import { ENUM_VALIDATION_OPTIONS } from "@data/enum"
import { IField } from "@data/interfaces"
import { faFacebookSquare, faInstagramSquare, faTwitterSquare } from "@fortawesome/free-brands-svg-icons"
import { ValidationsService } from "@shared/services/validations/validations.service"

export const CONST_LOGIN_PAGE : {
    FORM : {
        email : IField,
        password : IField
    };
    ICONS: any[];
    STYLE_BACKGROUND: any;
    LOGO: string;
    LOGO_LOGIN: string;
    LOGO_PUNTO_VERDE:String;
} = {
    FORM : {
        email : {
            val : '',
            error : ERROR_VALIDATIONS.ALERTS.EMAIL_REQUIRED,
            isValid : function () {
                const validationsService = new ValidationsService();
                const valitadeEmail = validationsService.validateField(this.val, ENUM_VALIDATION_OPTIONS.EMAIL)
                this.error = valitadeEmail.msg;
                return valitadeEmail.isValid;
            }
        },
        password : {
            val : '',
            error : ERROR_VALIDATIONS.ALERTS.PASSWORD_REQUIRED,
            isValid : function () {
                const validationsService = new ValidationsService();
                const validatePassword = validationsService.validateField(this.val, ENUM_VALIDATION_OPTIONS.PASSWORD)
                this.error = validatePassword.msg;
                return validatePassword.isValid;
            }
        }
    },
    ICONS : [
        faFacebookSquare,
        faTwitterSquare,
        faInstagramSquare
    ],
    STYLE_BACKGROUND : {
        'background-image': `url(${IMAGE_ROUTES.backgroundLogin})`
    },
    LOGO : IMAGE_ROUTES.logoLogin,
    LOGO_PUNTO_VERDE:IMAGE_ROUTES.logoPuntoVerde,
    LOGO_LOGIN : IMAGE_ROUTES.logoLogin_1
} 
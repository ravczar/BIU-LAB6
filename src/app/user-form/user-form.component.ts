import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from "@angular/forms";
import { debounceTime } from 'rxjs/operators';

function passwordMatcher(c: AbstractControl):{[key:string]:boolean}|null{   
  let passwordControl = c.get('password');   
  let confirmPasswordControl = c.get('cPassword');   
  if(passwordControl.pristine || confirmPasswordControl.pristine)     
    return null;
  if(passwordControl.value === confirmPasswordControl.value)     
    return null;   
  return {
    'matchPasswords':true
  }; 

} 

@Component({
  selector: 'user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  // Słownik dla matchPasswordsMsg
  passwordMessages={
    matchPasswords:"Passwords don't MATCH",     
    pattern: "Password is invalid: (1xUpperCase, 1xLowerCase, 1xNumber 1xSpecial<@ # $ %> and min 6 Chars)"   
  };

  matchPasswordsMsg: string;   
  passwordPatternMsg: string;

  userForm: FormGroup;
  userExists:boolean=false;
  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {

    // html5pattern.com/  <- ready validators
    this.userForm = this.formBuilder.group({
      firstName: ['',[Validators.required, 
        Validators.pattern( '^[a-zA-Z]{2,20}$' )]], 
      lastName:  ['',[Validators.required, 
        Validators.pattern( '^[a-zA-Z]{2,50}$' )]],
      email:  ['',[Validators.required, 
        Validators.email]],
      phone:  ['',[Validators.required, 
        Validators.pattern('[0-9]{9}')]],
      username:  ['',[Validators.required, 
        Validators.pattern('^[A-Za-z0-9_]{1,15}$')]],
      pswdGroup: this.formBuilder.group({         
        password:  ['',[Validators.required, 
          Validators.pattern( '((?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%]).{6,20})' )]],         
        cPassword:  ['',[Validators.required]]
      },{
        validator: passwordMatcher
      })
    });

    this.userForm.get('username').valueChanges.pipe(debounceTime(1000)).subscribe(value=>{
      if(value==='admin')
        this.userExists=true;
      else this.userExists=false;
    });
    
    // Logic filling  ‘passwordPatternMsg’ and ’matchPasswordsMsg’ 
    let passwordGroup = this.userForm.get("pswdGroup");     
    let password = this.userForm.get("pswdGroup.password");     
    password.valueChanges.pipe(debounceTime(500)).subscribe(value=>{       
      this.passwordPatternMsg='';         
      if((password.touched||password.dirty)&&password.getError('pattern')){           
        this.passwordPatternMsg = this.passwordMessages['pattern'];         
      }     
    });

    let confirmPassword = this.userForm.get("pswdGroup.cPassword");     
    confirmPassword.valueChanges.pipe(debounceTime(500)).subscribe(value=>{       
      this.matchPasswordsMsg='';   

    if((confirmPassword.touched||confirmPassword.dirty) && passwordGroup.getError('matchPasswords')){ 
        this.matchPasswordsMsg = this.passwordMessages['matchPasswords'];         
      }     
    });

  }

  populateTestData(){
    let passwordGroup = this.userForm.get("pswdGroup"); 
    
    this.userForm.patchValue({
      firstName: 'Rafal',
      lastName: 'Czarnecki',
      email: 'ravczar@gmail.com',
      phone: '777222555',
      username: 'ravczar'
    });
    passwordGroup.patchValue({
      password: 'Rafal89#',
      cPassword: 'Rafal89#'
    });
  }

  onSubmit() {
    let array : Array<string> = new Array<string>();
    if(this.userForm.valid){
      array.push(this.userForm.get("firstName").value);
      array.push(this.userForm.get("lastName").value);  
      array.push(this.userForm.get("email").value);  
      array.push(this.userForm.get("phone").value);  
      array.push(this.userForm.get("username").value);  
      array.push(this.userForm.get("pswdGroup.password").value);  
      array.push(this.userForm.get("pswdGroup.cPassword").value);
      alert('SUCCESS!! :-): ' + array );
    }
    else {
      alert("Please recheck your fileds, some might be still INVALID!")
    }
}




}

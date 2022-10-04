<template>
    <div>
        <a-typography-title>Create New Account</a-typography-title>
        <a-form>
            <a-form-item label="User">
            <a-input v-model:value="username" placeholder="Enter Employee Username" />
            </a-form-item>
            <a-form-item label="Password">
            <a-input-password v-model:value="password" placeholder="Enter Password (leave blank for auto generate)" />
            </a-form-item>

            <a-form-item label="Name">
            <a-input v-model:value="nameField" placeholder="Enter Employee Name" />
            </a-form-item>
            <a-form-item label="Address">
            <a-input v-model:value="address" placeholder="Enter Employee Address" />
            </a-form-item>
            <a-form-item label="Payroll Account">
            <a-input v-model:value="payrollAccount" placeholder="Enter Employee payroll account" />
            </a-form-item>

            <a-form-item name="radio-button" label="Account Type" >
                <a-radio-group v-model:value="accountType">
                    <a-radio-button value="0">Employee</a-radio-button>
                    <a-radio-button value="1">Manager</a-radio-button>
                </a-radio-group>
            </a-form-item>

            <a-form-item name="switch" label="Activate Account Immediately">
                <a-switch v-model:checked="activateAccount" />
            </a-form-item>

            <a-form-item>
            <a-button type="primary" @click="createAccount">Submit</a-button>
            </a-form-item>
            <p>{{editResult}}</p>
        </a-form>

        <a-modal v-model:visible="visible" title="Account Creation Result" @ok="handleOk">
            <p>{{createResult}}</p>
        </a-modal>
    </div>
</template>

<script setup>
//this is for HR only
// FUNCTIONAL REQUIREMENT 16.1: HR will be able to add new Employee and Manager accounts
    const username = ref("")
    const password = ref("")
    const nameField = ref("")
    const address = ref("")
    const payrollAccount = ref("")
    const accountType = ref("0")
    const activateAccount = ref(false)

    const createResult = ref("")
    const visible = ref(false)


    const createAccount = async () => {
        if (username.value.toString().length < 3 || password.value.toString().length < 3) {
            createResult.value = "Username and password to be at least 3 long!"
            visible.value = true
            return
        }

        const {data: createAcc, pending, error, refresh} = await useAsyncData('createAcc', () => 
        $fetch('/server-api/register', {
            method: 'POST',
            body: {
                user: username.value,
                password: password.value,
                access_type: accountType.value,
                name: nameField.value,
                address: address.value,
                payroll_account: payrollAccount.value,
                active: activateAccount.value == true ? 1 : 0
            }
        }), {initialCache: false})

        if (createAcc.value.result == "success") {
            createResult.value = "Account creation successful"
        }
        else {
            createResult.value = createAcc.value.message
        }
        
        visible.value = true;
    }

    const handleOk = (e) => {
      visible.value = false
    }


</script>
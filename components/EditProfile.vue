

<template>
    <div>
        <a-typography-title>Edit Your Profile</a-typography-title>
        <a-form>
            <a-form-item label="Name">
            <a-input v-model:value="nameField" placeholder="Enter your name" />
            </a-form-item>
            <a-form-item label="Address">
            <a-input v-model:value="addressField" placeholder="Enter your address" />
            </a-form-item>
            <a-form-item label="Payroll Account">
            <a-input v-model:value="payrollAccountField" placeholder="Enter your payroll account" />
            </a-form-item>
            <a-form-item>
            <a-button type="primary" @click="updateProfile">Submit</a-button>
            </a-form-item>
            <p>{{editResult}}</p>
        </a-form>
    </div>
</template>

<script setup>
//FUNCTIONAL REQUIREMENT 18: UPDATE OWN PROFILE + (ADDON: GET PROFILE)
    const nameField = ref("")
    const addressField = ref("")
    const payrollAccountField = ref("")
    const editResult = ref("")

    onMounted(async () => {
        console.log("we have mounted")
        const {data: message, pending, error, refresh} = await useAsyncData('message', () => $fetch('/server-api/get_profile'))
        await refresh()

        console.log(message.value)
        if (message.value.result == "success") {
            var data = JSON.parse(message.value.message)
            console.log(data[0])
            nameField.value = data[0].name
            addressField.value = data[0].address
            payrollAccountField.value = data[0].payroll_account
        }
        else {
            console.log("fail")
        }

    })
    
    const updateProfile = async () => {
        const {data: updateResult, pending, error, refresh} = await useAsyncData('updateResult', () => {
            return $fetch('/server-api/update_profile', {
                method: 'POST',
                body: {
                    name: nameField.value,
                    address: addressField.value,
                    payroll_account: payrollAccountField.value,
                }
            })
        })
        await refresh()
        console.log(updateResult)
        if (updateResult.value.result == "success") {
            editResult.value = "successful updated" //TODO: box confirmation
        }
        else {
            editResult.value = "Failed to update"
        }
    }
</script>
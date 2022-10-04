<template>
    <div>
        <a-typography-title>Reset Password</a-typography-title>
        <a-form>
            <a-form-item label="Old Password">
            <a-input-password v-model:value="oldPassword" placeholder="Enter your old Password" />
            </a-form-item>
            <a-form-item label="New Password">
            <a-input-password v-model:value="newPassword" placeholder="Enter new password" />
            </a-form-item>
            <a-form-item>
            <a-button type="primary" @click="resetPassword">Submit</a-button>
            </a-form-item>
            <p>{{editResult}}</p>
        </a-form>
    </div>
</template>

<script setup>
//FUNCTIONAL REQUIREMENT 17: RESET OWN CREDENTIALS
    const oldPassword = ref("")
    const newPassword = ref("")
    const editResult = ref("")

    const resetPassword = async () => {
        //TODO:
        const {data: reset, pending, error, refresh} = await useAsyncData('reset', () => $fetch('/server-api/reset_password',
        {
            method: 'POST',
            body: {
                old_password: oldPassword.value,
                new_password: newPassword.value,
            },
        }), { initialCache: false })

        if (reset.value.result == "failure") {
            editResult.value = reset.value.message
        }
        else {
            editResult.value = reset.value.result
        }

    }

</script>
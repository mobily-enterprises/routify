 This element implements the validation API, extending it. It allows you to
 set custom validators, as well as custom error messages for native regexp-based
 validation.

 For example:

````html
<nn-input-text id="group" name="group"></nn-input-text>
<script>
  group.validator = () => {
    const value = document.querySelector('#group').value
    if (group.value.startsWith('a')) return 'No group can start with "a"'
  }
</script>
 ````

This will ensure that upon validation the field will display the error
`No group can start with "a"` if the field starts with "a".

Note that validation will happen before form submission.

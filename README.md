# next-env-safe
> If you accidentally access a server key on the client, **next-env-safe** will throw with a clear error.


---


## API


```ts
createEnv({
server: { ...zodSchemas },
client: { ...zodSchemasStartingWithNEXT_PUBLIC_ },
runtimeEnv: process.env,
clientPrefix?: string, // default: 'NEXT_PUBLIC_'
verbose?: boolean,
}) => {
// merged object
// server keys only present on server
// client keys present on both
client: { ...only client keys }
}
```


### Rules
- Server keys **must not** start with `NEXT_PUBLIC_` (or your custom prefix)
- Client keys **must** start with `NEXT_PUBLIC_` (or your custom prefix)
- On the server, both server+client are validated
- On the client, only client keys are available


---


## Why this over hand-rolled solutions?
- One file, one API
- Compile/startup fails fast when envs are missing
- Strong type inference from Zod
- Safer client/server separation with runtime guard


---


## Type Inference Example
```ts
const env = createEnv({
server: { FOO: z.number().int() },
client: { NEXT_PUBLIC_BAR: z.string() },
runtimeEnv: process.env,
});


// env.FOO: number
// env.client.NEXT_PUBLIC_BAR: string
```


---


## FAQ


**Q: Can I change the client prefix?**
Yes:
```ts
createEnv({ clientPrefix: "PUBLIC_", ... })
```
All client keys must start with `PUBLIC_` then.


**Q: Will server values be bundled in client JS?**
The returned object omits server values on the client and throws if you try to access them. Avoid importing server-only files inside Client Components to keep bundles lean.


**Q: Do I need different files for server/client?**
Not required. Import `env` in server code and `env.client` in client code.


---


## License
MIT © Ali


// FILE: LICENSE
MIT License


Copyright (c) 2025 Ali


Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:


The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.


THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
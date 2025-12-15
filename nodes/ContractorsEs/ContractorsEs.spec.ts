import {ContractorsEs} from "./ContractorsEs.node";

test("smoke", () => {
    const node = new ContractorsEs()
    expect(node.description.properties).toBeDefined()
})

/*
	Scan for noise sequences by comparing true and false words.
*/

➮ load_test {
	O ∆ ⛁ ('dada/dic') ≂.toLowerCase() ⌶ '\n'
	E ∆ ⛁ ('dada/er.15m') ≂.toLowerCase() ⌶ '\n'
	E = E ⋃(0, O↥)
	$ [O, E]
}

allc ∆ "abcdefghijklmonpqrstuvwxyz'"

➮ pass subc {
	e ∆ 0  o ∆ 0
	i ► O  ❰i ≀ subc >= 0❱ o++
	i ► E  ❰i ≀ subc >= 0❱ e++
	garbage[subc] = [o,e]
}

➮ build_garbage2 {
	ロ 'scan for 2-char garbage...'
	T ∆ ⚡
	ロ '  'allc
	ロロ '  '
	⧗ (a ∆ 0; a < allc↥; a++) {
		ロロ '^\u0008'
		⧗ (b ∆ 0; b < allc↥; b++) 
			pass(allcᵃ + allcᵇ)
		ロロ' '
	}
	ロ ''
	name ∆ 'dada/garbage2.scan.'+⚡
	⛃ (name, ꗌgarbage)
	ロ 'saved ' (ꗌgarbage↥) ' to 'name
	T = ⬠((⚡ - T)/1000)
	ロ 'step time: ' T ' seconds, full time estimate:', ⬠((T*allc↥)/60) ' minutes'
	ロ
}

➮ build_garbage3 {
	ロ 'scan for 3-char garbage ('allc↥' times longer)...'
	ロ '  'allc
	ロロ '  '
	⧗ (a ∆ 0; a < allc↥; a++) {
		ロロ '^\u0008'
		⧗ (b ∆ 0; b < allc↥; b++) {
			⧗ (c ∆ 0; c < allc↥; c++) {
				pass(allcᵃ + allcᵇ + allcᶜ)
			}
		}
		ロロ' '
	}
	ロ ''
	name ∆ 'dada/garbage3.scan.'+⚡
	⛃ (name, ꗌgarbage)
	ロ 'saved ' (ꗌgarbage↥) ' to 'name
}


tab ∆ {}
O, E ꔪ load_test()

garbage ∆ {}
build_garbage2()

garbage ∆ {}
build_garbage3()

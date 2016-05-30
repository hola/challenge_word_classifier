/*
	Use scan data to build noise sequences
*/
≣ 'lib/garbage_filter'
≣ 'lib/aricode'

scan2 ∆ ꖇ (⛁ 'dada/garbage2.scan' ≂)
scan3 ∆ ꖇ (⛁ 'dada/garbage3.scan' ≂)

TUNE = 8

➮ sort_obj {
	R ∆ []
	K ∆ ⚷ a
	i ► K  {
		z ∆ aⁱ
		z⁰ = ⬠(z⁰)
		z¹ = ⬠(z¹)
		param ∆ (z¹/z⁰)
		R ⬊ ([i,param])
	}

	R = R ꔬ (➮{ $ a¹ >= TUNE })
	R ❄(➮{$b¹-a¹})
	$R
}

➮ zip_garbage {
	allc ∆ "abcdefghijklmonpqrstuvwxyz'"
	zip ∆ ''
	➮ record {
		❰garbageᵃ❱
			zip += '1'
		◇
			zip += '0'
			⁋
	}
	⧗ (a ∆ 0; a < allc↥; a++) 
	⧗ (b ∆ 0; b < allc↥; b++) 
		record(allcᵃ + allcᵇ)
	⧗ (a ∆ 0; a < allc↥; a++)
	⧗ (b ∆ 0; b < allc↥; b++) 
	⧗ (c ∆ 0; c < allc↥; c++) 
		record(allcᵃ + allcᵇ + allcᶜ)
	⛃('dada/garbage.10', zip)
	ari_file_encode('dada/garbage.10', ⦿)
}

➮ mk_garbage_obj {
	z ► a  garbage[z⁰] = 1
}

➮ gbuild {
	garbage = {}
	top2 ∆ sort_obj(scan2)
	top3 ∆ sort_obj(scan3)
	mk_garbage_obj(top2)
	mk_garbage_obj(top3)
	zip_garbage()
}

gbuild()
